# /tests/simple

Folder contains all tests which are essential for app to work. Basic checks of response status codes and body structure are of main focus.

## user.test.js

Tests for user API endpoints

## quiz.test.js

Tests for quiz API endpoints

## question.test.js

Tests for questions API endpoints

## response.test.js

Tests for responses API endpoints

## search.test.js

Tests for search API functionality

## health.test.js

Test for overall app health check

By default individual test suites are decoupled; any tests added to a suite should not take another suite as depedancy. Ideally, all data must be removed after each test suite.
