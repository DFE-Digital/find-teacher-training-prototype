You could be eligible for either:

- a bursary of £{{ course.bursary_amount | numeral('0,0') }}
- a scholarship of £{{ course.scholarship_amount | numeral('0,0') }}

{% if course.has_early_career_payments %}
With a scholarship or bursary, you’ll also get early career payments of £2,000 in your second, third and fourth years of teaching (£3,000 in [some areas of England](https://www.gov.uk/guidance/mathematics-early-career-payments-guidance-for-teachers-and-schools)).
{% endif %}

To be eligible for a bursary you’ll need a 2:2 degree in any subject. You do not need to apply for a bursary. If you’re eligible, you’ll automatically start receiving it when you start the course.

{% if course.scholarship_body %}
For a scholarship, you’ll need to apply through the {{ course.scholarship_body }}. [Check whether you’re eligible for a scholarship and find out how to apply]({{ course.scholarship_url }})
{% endif %}

You may also be eligible for a student loan. These are normally for undergraduate courses but you can also apply if you do postgraduate teacher training. [Find out how much loan you could get using the student finance calculator](https://www.gov.uk/student-finance-calculator).

Depending on your immigration status, financial support may not be available. Find out about [training to teach if you’re a non-UK citizen](https://www.gov.uk/government/publications/train-to-teach-in-england-non-uk-applicants/train-to-teach-in-england-if-youre-a-non-uk-citizen), including financial support.
