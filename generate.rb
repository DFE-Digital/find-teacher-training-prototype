#!/usr/bin/env ruby
# Grab courses-clean.json from search-and-compare-data repo
# Run './generate.rb'
require 'json'
file = File.read('courses-clean.json')
data = JSON.parse(file)

prototype_data = {
  "study-type": ["Full time (12 months)", "Part time (18-24 months)"],
  "qualification": ["Postgraduate certificate in education with qualified teacher status", "Qualified teacher status"],
  "results": []
}


File.open('lib/prototype_data.json', 'w') { |file| file.write(JSON.pretty_generate(prototype_data) + "\n") }
