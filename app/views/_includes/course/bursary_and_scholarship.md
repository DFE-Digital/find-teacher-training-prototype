You could be eligible for either:

- a scholarship of £{{ (course.scholarship_amount | int).toLocaleString() }}
- a bursary of £{{ (course.bursary_amount | int).toLocaleString() }}

{% if course.has_early_career_payments %}
With a scholarship or bursary, you’ll also get early career payments of £2,000 in your second, third and fourth years of teaching (£3,000 in [some areas of England](https://www.gov.uk/guidance/mathematics-early-career-payments-guidance-for-teachers-and-schools)).
{% endif %}

To qualify for a scholarship you’ll need a degree of 2:1 or above in {{ course.subject_name }} or a related subject. For a bursary you’ll need a 2:2 or above in any subject.

You cannot claim both a bursary and a scholarship - you can only claim one.

[Find out more about bursaries and scholarships](#). You do not need to apply for a bursary - if you’re eligible, you’ll automatically start receiving it once you begin your course.

You may also be eligible for a [loan while you study](https://getintoteaching.education.gov.uk/funding-my-teacher-training/tuition-fee-and-maintenance-loans).

Find out about financial support if you’re from [outside the UK](https://www.gov.uk/government/publications/train-to-teach-in-england-non-uk-applicants/train-to-teach-in-england-if-youre-a-non-uk-citizen#rate).
