#!/usr/bin/env ruby
# Grab courses-clean.json from search-and-compare-data repo
# Run './generate.rb'
require 'json'
gem 'json5'
require 'json5'
require 'csv'
file = File.read('courses-clean.json')

geo_file = File.read('geocoded_address_data.json')
geocoded_addresses = JSON.parse(geo_file)

addresses_file = File.read('provider_address_website.json')
addresses = JSON.parse(addresses_file)

course_enrichments = CSV.read('course-enrichment.csv', :headers => true)
inst_enrichments = CSV.read('institution-enrichment.csv', :headers => true)

data = JSON.parse(file)
sample = data.reject {|c| c['campuses'].empty? }.reject {|c| c['subjects'].include?('WELSH') }

def to_slug(string)
  string.downcase.gsub(/[^a-zA-Z0-9]/, '-').gsub(/--*/, '-').gsub(/-$/,'')
end

prototype_data = {
  "study-type": ["Full time (12 months)", "Part time (18-24 months)"],
  "qualification": ["PGCE with QTS (Postgraduate certificate in education with qualified teacher status)", "QTS (Qualified teacher status)"],
  "selectedSubjects": []
}

prototype_data['subjects'] = data.map { |c| c['subjects'].map {|s| s.downcase.capitalize } }.flatten.uniq.sort

# Clean up subjects
# prototype_data['subjects'].reject! { |s| s.include?('abridged') || s.include?('Secondary') }

prototype_data['groupedSubjects'] = {
  "Primary": [
    "Primary",
    "Lower primary",
    "Upper primary",
    "Early years"
  ],
  "Secondary": [
    "Art / art & design",
    "Biology",
    "Business education",
    "Chemistry",
    "Classics",
    "Communication and media studies",
    "Computer studies",
    "Dance and performance",
    "Design and technology",
    "Design and technology (food)",
    "Design and technology (product design)",
    "Design and technology (systems and control)",
    "Design and technology (textiles)",
    "Drama and theatre studies",
    "Economics",
    "Engineering",
    "English",
    "English language",
    "English literature",
    "Geography",
    "Greek",
    "Health and social care",
    "History",
    "Humanities",
    "Information communication technology",
    "Information technology",
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
    "Social science"
  ],
  "Modern languages": [
    "Languages",
    "Languages (asian)",
    "Languages (european)",
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
  "Other subjects": [
    "Citizenship",
    # "Literacy", # Only University of Greenwich
    "Post-compulsory",
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

  subjects = c['subjects'].map {|s| s.downcase.capitalize }

  course = {
    locationType: c['route'] == 'Higher Education programme' ? 'University' : 'School',
    accrediting: c['accrediting'],
    provider: c['provider'].gsub("'", "’"),
    subjects: subjects,
    name: c['name'],
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
    rescue SyntaxError
    rescue
    end
  end

  course
end

# Don't include courses without geocodes
prototype_data['courses'].reject! { |c| !(c[:enrichment] && c[:inst]) }
prototype_data['courses'].reject! { |c| !c[:addresses] || c[:addresses].any? { |a| !a || !a['geocode'] } }
prototype_data['courses'].reject! { |c| !c[:providerAddress] || !c[:providerAddress]["latitude"] }

puts "#{prototype_data['courses'].length} courses"
File.open('lib/prototype_data.json', 'w') { |file| file.write(JSON.pretty_generate(prototype_data) + "\n") }
