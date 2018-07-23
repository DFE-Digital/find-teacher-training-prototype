#!/usr/bin/env ruby
# Grab courses-clean.json from search-and-compare-data repo
# Run './generate.rb'
require 'json'
file = File.read('courses-clean.json')

geo_file = File.read('geocoded_address_data.json')
geocoded_addresses = JSON.parse(geo_file)

addresses_file = File.read('provider_address_website.json')
addresses = JSON.parse(addresses_file)

data = JSON.parse(file)
sample = data.reject {|c| c['campuses'].empty? }.reject {|c| c['subjects'].include?('WELSH') }.sample(1000)

def to_slug(string)
  string.downcase.gsub(/[^a-zA-Z0-9]/, '-').gsub(/--*/, '-').gsub(/-$/,'')
end

prototype_data = {
  "study-type": ["Full time (12 months)", "Part time (18-24 months)"],
  "qualification": ["Postgraduate certificate in education with qualified teacher status", "Qualified teacher status"],
  "selectedSubjects": ["Biology", "Mathematics"]
}

prototype_data['subjects'] = data.map { |c| c['subjects'].map {|s| s.downcase.capitalize } }.flatten.uniq.sort

# Clean up subjects
prototype_data['subjects'].reject! { |s| s.include?('abridged') || s.include?('Secondary') }

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

  course = {
    locationType: c['route'] == 'Higher Education programme' ? 'University' : 'School',
    accrediting: c['accrediting'],
    provider: c['provider'].gsub("'", "’"),
    subjects: c['subjects'].map {|s| s.downcase.capitalize },
    name: c['name'],
    slug: "#{c['providerCode']}/#{c['programmeCode']}",
    providerCode: c['providerCode'],
    programmeCode: c['programmeCode'],
    schools: c['campuses'].map { |a| { name: a['name'], address: a['address'], code: a['code'] } },
    addresses: c['campuses'].map { |a| geocoded_addresses.find {|g| g['address'] == a['address'] } },
    providerAddress: addresses.find {|a| a['inst_code'] == c['providerCode'] },
    options: options
  }

  course
end

# Don't include courses without geocodes
prototype_data['courses'].reject! { |c| !c[:addresses] || c[:addresses].any? { |a| !a || !a['geocode'] } }
prototype_data['courses'].reject! { |c| !c[:providerAddress] }

puts "#{prototype_data['courses'].length} courses"
File.open('lib/prototype_data.json', 'w') { |file| file.write(JSON.pretty_generate(prototype_data) + "\n") }
