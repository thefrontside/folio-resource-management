@Library ('folio_jenkins_shared_libs') _

buildNPM {
  publishModDescriptor = 'yes'
  runLint = 'yes'
  runTest = 'no'
  runSonarqube = true
  runTestOptions = '--bundle --karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit --coverage'
}
