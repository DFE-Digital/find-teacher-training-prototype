You could be eligible for a bursary of £{{ course.bursary_amount | numeral('0,0') }}.

To be eligible for a bursary you’ll need a 2:2 degree in any subject. You do not need to apply for a bursary. If you’re eligible, you’ll automatically start receiving it when you start the course.

You may also be eligible for a student loan. These are normally for undergraduate courses but you can also apply if you do postgraduate teacher training. [Find out how much loan you could get using the student finance calculator](https://www.gov.uk/student-finance-calculator).

Depending on your immigration status, financial support may not be available. Find out about [training to teach if you’re a non-UK citizen](https://www.gov.uk/government/publications/train-to-teach-in-england-non-uk-applicants/train-to-teach-in-england-if-youre-a-non-uk-citizen)

<!-- You’ll get a bursary of £{{ course.bursary_amount | numeral('0,0') }} if you have {{ course.bursary_first_line_ending if course.bursary_requirements.length > 1 else course.bursary_requirements[0] + "." }}

{% if course.bursary_requirements.length > 1 %}
{% for requirement in course.bursary_requirements %}
- {{ requirement }}
{% endfor %}
{% endif %}

You do not have to apply for a bursary - if you’re eligible, you’ll automatically start receiving it once you begin your course.

You may be eligible for a [loan while you study](https://getintoteaching.education.gov.uk/funding-my-teacher-training/tuition-fee-and-maintenance-loans).

Find out about financial support if you’re from [outside the UK](https://www.gov.uk/government/publications/train-to-teach-in-england-non-uk-applicants/train-to-teach-in-england-if-youre-a-non-uk-citizen#rate). -->
