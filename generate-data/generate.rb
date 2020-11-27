#!/usr/bin/env ruby
# Grab courses-clean.json from search-and-compare-data repo
# Run './generate.rb'
require 'json'
gem 'json5'
require 'json5'
require 'csv'
file = File.read('courses-clean.json')

def to_sentence(arr)
  case arr.length
  when 0
    ''
  when 1
    arr[0].to_s.dup
  when 2
    "#{arr[0]} or #{arr[1]}"
  else
    "#{arr[0...-1].join(', ')} or #{arr[-1]}"
  end
end

geo_file = File.read('../app/data/geocoded-provider-addresses.json')
geocoded_addresses = JSON.parse(geo_file)

addresses_file = File.read('../app/data/providers.json')
addresses = JSON.parse(addresses_file)

course_enrichments = CSV.read('course-enrichment.csv', :headers => true)
inst_enrichments = CSV.read('institution-enrichment.csv', :headers => true)

data = JSON.parse(file)
sample = data.reject {|c| c['campuses'].empty? }.reject {|c| c['subjects'].include?('WELSH') }

def to_slug(string)
  string.downcase.gsub(/[^a-zA-Z0-9]/, '-').gsub(/--*/, '-').gsub(/-$/,'')
end

prototype_data = {}

prototype_data['subjects'] = data.map { |c| c['subjects'].map {|s| s.downcase.capitalize } }.flatten.uniq.sort

# Clean up subjects
# prototype_data['subjects'].reject! { |s| s.include?('abridged') || s.include?('Secondary') }

prototype_data['groupedSubjects'] = {
  "Primary": [
    "Primary"
  ],
  "Secondary": [
    "Art and design",
    "Biology",
    "Business studies",
    "Chemistry",
    "Citizenship",
    "Classics",
    "Communication and media studies",
    "Computing",
    "Dance",
    "Design and technology",
    "Drama and theatre studies",
    "Economics",
    "Engineering",
    "English",
    "Geography",
    "Greek",
    "Health and social care",
    "History",
    "Humanities",
    "Information communication technology",
    "Latin",
    "Mathematics",
    "Music",
    "Outdoor activities",
    "Personal and social education",
    "Philosophy",
    "Physical education",
    "Physics",
    "Psychology",
    "Religious education",
    "Science",
    "Social sciences"
  ],
  "Secondary: Modern languages": [
    "Languages",
    "Arabic",
    "English as a second or other language",
    "French",
    "German",
    "Italian",
    "Japanese",
    "Mandarin",
    "Russian",
    "Spanish",
    "Urdu",
    "Welsh"
  ],
  "Further education": [
    # "Literacy", # Only University of Greenwich
    "Further education",
    # "Middle years", No courses
    # "Numeracy", Only University of Greenwich
    "Special educational needs"
  ]
}

prototype_data['courses'] = sample.map do |c|
  options = []

  if !c['qualifications'] || c['qualifications'].length == 0
    qual = "Unknown"
  else
    qual = (c['qualifications'].include?('Postgraduate') || c['qualifications'].include?('Professional')) ? 'PGCE with QTS' : 'QTS'
  end
  partTime = c['campuses'].map {|g| g['partTime'] }.uniq.reject {|r| r == "n/a"}.count > 0
  fullTime = c['campuses'].map {|g| g['fullTime'] }.uniq.reject {|r| r == "n/a"}.count > 0
  salaried = c['route'] == "School Direct training programme (salaried)" ? ' with salary' : ''

  if partTime && fullTime
    options << "#{qual}, full time or part time#{salaried.length > 0 ? ', ' + salaried : ''}"
  else
    if partTime
      options << "#{qual}, part time#{salaried}"
    end

    if fullTime
      options << "#{qual}, full time#{salaried}"
    end
  end

  subjects = c['subjects'].map do |s|
    subject = s.downcase.capitalize

    replacements = [
      [/\s\([^)]+\)/, ''], # Remove any text in brackets
      ["Computer studies", "Computing"],
      ["English literature", "English"],
      ["English language", "English"],
      ["Art / art & design", "Art and design"],
      ["Business education", "Business studies"],
      ["Engineering", "Design and technology"],
      ["Dance and performance", "Dance"],
      ["Drama and theatre studies", "Drama"],
      ["Social science", "Social sciences"],
      ["Lower primary", "Primary"],
      ["Upper primary", "Primary"],
      ["Chinese", "Mandarin"],
      ["Literacy", "Further education"],
      ["Numeracy", "Further education"],
      ["Post-compulsory", "Further education"],
      ["Information technology", "Information communication technology"]
    ]
    replacements.each {|replacement| subject.gsub!(replacement[0], replacement[1])}

    subject
  end

  subjectsWithScholarships = [
    'Chemistry',
    'Geography',
    'Physics',
    'Computing',
    'French',
    'Spanish',
    'German'
  ]

  subjectsWithBursaries = [
    'Chemistry',
    'Geography',
    'Physics',
    'Computing',
    'French',
    'Spanish',
    'German',
    'Biology',
    'Classics',
    'English',
    'History',
    'Music',
    'Religious education',
    'Design and technology',
    'Mathematics'
  ];

  financial_support = []
  if c['route'] == 'School Direct training programme (salaried)'
    financial_support << 'Salary'
  else
    if (subjects & subjectsWithBursaries).any?
      financial_support << 'Bursary'
    end

    if (subjects & subjectsWithScholarships).any?
      financial_support << 'Scholarship'
    end

    financial_support << 'Student finance if you’re eligible'
  end

  course = {
    locationType: c['route'] == 'Higher Education programme' ? 'University' : 'School',
    accrediting: c['accrediting'],
    provider: c['provider'].gsub("'", "’"),
    subjects: subjects.uniq,
    name: c['name'],
    financial_support: to_sentence(financial_support),
    slug: "#{c['providerCode']}/#{c['programmeCode']}",
    providerCode: c['providerCode'],
    programmeCode: c['programmeCode'],
    schools: c['campuses'].map { |a| { name: a['name'], address: a['address'], code: a['code'] } },
    addresses: c['campuses'].map { |a| geocoded_addresses.find {|g| g['address'] == a['address'] } },
    providerAddress: addresses.find {|a| a['inst_code'] == c['providerCode'] },
    options: options
  }

  e = course_enrichments.find {|e| e["ucas_course_code"] == c['programmeCode']}
  if e
    begin
      # JSON data isn't valid JSON. It contains single quotes.
      # Use JSON5 to parse most of the entries: https://github.com/bartoszkopinski/json5
      json_data = JSON5.parse(e["json_data"])
      course[:enrichment] = json_data
      course[:has_enrichment] = true
      # puts "Success: #{c['programmeCode']}"
    rescue SyntaxError
      # It's ok to ignore some of the courses
      # puts "Syntax error: #{c['programmeCode']}"
    rescue
      # puts "Error: #{c['programmeCode']}"
    end
  end

  i = inst_enrichments.find {|e| e["inst_code"] == c['providerCode']}
  if i
    begin
      json_data = JSON5.parse(i["json_data"])
      course[:inst] = json_data
      course[:has_inst] = true
    rescue SyntaxError
    rescue
    end
  end

  if (course[:has_inst] && course[:has_enrichment])
    File.open("../app/data/courses/course_#{c['providerCode']}_#{c['programmeCode']}.json", 'w') do |file|
      file.write(JSON.pretty_generate(course) + "\n")
    end
  end

  course.delete(:inst)
  course.delete(:enrichment)
  course.delete(:schools)
  #course.delete(:addresses)
  course
end

# Don't include courses without geocodes or enrichments
prototype_data['courses'].reject! { |c| !(c[:has_enrichment] && c[:has_inst]) }
prototype_data['courses'].reject! { |c| !c[:providerAddress] || !c[:providerAddress]["latitude"] }

puts "#{prototype_data['courses'].length} courses"
File.open('../app/data/courses.json', 'w') { |file| file.write(JSON.pretty_generate(prototype_data) + "\n") }
