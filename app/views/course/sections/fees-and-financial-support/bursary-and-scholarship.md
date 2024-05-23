**Bursaries**

This course has a bursary of £{{ course.bursary_amount | numeral('0,0') }} available to eligible trainees.

[Find out whether you are eligible for a bursary](https://getintoteaching.education.gov.uk/funding-and-support/scholarships-and-bursaries).

**Scholarships**

This course has a scholarship of £{{ course.scholarship_amount | numeral('0,0') }} available to eligible trainees.


{% if course.scholarship_body %}
[Find out whether you’re eligible for a scholarship]({{ course.scholarship_url }}).
{% endif %}

**Student loans**

You may be eligible for student loans to cover the cost of your tuition fee or to help with living costs.

[Find out more about student loans for teacher training](https://getintoteaching.education.gov.uk/funding-and-support/tuition-fee-and-maintenance-loans).
