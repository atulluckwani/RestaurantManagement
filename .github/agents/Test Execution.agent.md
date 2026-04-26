---
name: Test Execution
description: This helps in triggering the test cases
argument-hint: The inputs this agent should take is the target folder".
# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->

Execute all the test cases present under Target folder. Ask this target folder from the user as an Input. Generate an html report having the test case name, execution result, timestamps, screenshots that were taken as part of the execution. Create a folder with name as today's date under C:\Workspace\repo\RestaurantManagement\Screenshots and store all screenshots and html report in that folder. Screenshots should be named as test case name_timestamp.png and html report should be named as TestExecutionReport_timestamp.html. Timestamp should be in the format of YYYYMMDD_HHMMSS. After execution, share the html report with the user.
