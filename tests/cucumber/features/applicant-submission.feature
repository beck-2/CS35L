Feature: Applicant Submission
  As an applicant
  I want to submit my application
  So that I can apply to join a club

  Scenario: Submit application
    Given I am on the application form page
    When I fill in my information
    And I submit the form
    Then I should see a success message
