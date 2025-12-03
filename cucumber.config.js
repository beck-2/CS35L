export default {
  require: ['tests/cucumber/step-definitions/**/*.js'],
  format: ['progress', 'html:tests/reports/cucumber-report.html'],
  paths: ['tests/cucumber/features/**/*.feature'],
  requireModule: ['@babel/register'],
  publishQuiet: true
};
