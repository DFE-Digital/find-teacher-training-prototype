#!/usr/bin/env ruby
# Grab courses-clean.json from search-and-compare-data repo
# Run './generate.rb'
gem 'geocoder', '~>1.4.9'
require 'geocoder'

require 'json'
file = File.read('geocoded_address_data.json')
geocoded_addresses = JSON.parse(file)

Geocoder.configure(
  lookup: :google,
  api_key: ENV['GOOGLE_API_KEY'],
  timeout: 5,
  units: :km,
  use_https: true
)

# Get unique addresses to start with
# addresses = data.map { |c| c['campuses'].map {|ca| ca['address'] }}.flatten.uniq

geocoded_addresses.each do |a|
  unless a['geocode']
    sleep(0.2)
    geocode_results = Geocoder.search(a)

    unless geocode_results.empty?
      puts "Geocoded: #{a}"
      geocode = geocode_results.first
      a["geocode"] = true
      a["formatted_address"] = geocode.formatted_address
      a["latitude"] = geocode.latitude
      a["longitude"] = geocode.longitude
      a["post_code"] = geocode.postal_code
      a["city"] = geocode.city
      a["route"] = geocode.route

      address_components = geocode.data['address_components']
      postal_town = address_components.find { |a| a['types'].include?('postal_town') }
      a['postal_town'] = postal_town['long_name'] if postal_town
    end
  end
end

File.open('geocoded_address_data.json', 'w') { |file| file.write(JSON.pretty_generate(geocoded_addresses) + "\n") }
