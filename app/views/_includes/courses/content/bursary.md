You’ll get a bursary of £{{ course.bursary_amount.toLocaleString() }} if you have a degree of 2:2 or above in any subject.

{% if course.bursary_requirements.length > 1 %}
{% for requirement in course.bursary_requirements %}
* {{ requirement }}
{% endfor %}
{% endif %}

You do not have to apply for a bursary – if you’re eligible, you’ll automatically start receiving it once you begin your course. Find out about [eligibility](https://getintoteaching.education.gov.uk/funding-my-teacher-training/bursaries-and-scholarships-for-teacher-training) and [how you’ll be paid](https://getintoteaching.education.gov.uk/funding-and-salary/overview/how-you-will-be-paid).

You may also be eligible for a [loan while you study](https://getintoteaching.education.gov.uk/funding-my-teacher-training/tuition-fee-and-maintenance-loans) – note that you’ll have to apply for [undergraduate student finance](https://www.gov.uk/student-finance).

Find out about financial support if you’re from [outside the UK](https://beta-getintoteaching.education.gov.uk/guidance/financial-support-for-international-applicants).
