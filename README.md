# About
Praxis is/ strives to become, an online IDE for visual programming in Prolog. It is (currently) a 100% in-browser application, meaning that there is no component running on any server. -You can just download the repo and run it from your local file system, without any build-steps or other preparations.

Server component will be added as optional feature in the future (for example, allow users to log in and store their models online, for easy sharing and integration/ publishing), but I will strive to maintain the advantage of having a system that is useful also without any specific server running.

Praxis uses Tau-Prolog to allow you to run/ test models in the browser.

Released under the MIT license.

## Current state
Version 0.1.0 is available to run here, in your browser: https://toblotron.com/praxis/0.1.0/

### You can
* **Create models**, and store them locally on your on machine.
* **Draw rules** (using shapes representing different Prolog statements)
* **Edit tabular** data in Excel-like pages.
* **Run / ask** questions to your model, directly in the browser.
* **import libraries** (WIP) from URL's, and use the (Tau-Prolog) code therein. 

## Goals for next version (0.2.0)
* **Introduction of pratt-parser**, and generation of an intermediate Abstract Syntax Tree before code generation, allowing better control over parsing and generation of error-messages.
* **Handling schema-defined types**, (editing, importing from schema, using specialized shapes to process structured data) allowing handy integration of your logic models through (for example) a REST-service interface. 
* **Creating developer documentation**, for easier understanding of what the system is and how the different parts work together. Documentation is kind of a thing of mine, so I am ambitious about this.

## Praxis website
Praxis is hosted on https://toblotron.com/praxis/0.1.0/ - right now it contains only the web-app and a blog (https://toblotron.com/blog/) where interesting developments are sometimes announced.

## Installation

You do not need to install the Praxis IDE - either run it in the browser, or download this repo and run it from you local machine. It's that simple.

## Contributions

Contributions are very welcome - in fact, version 0.1.0 has been developed with the goal of attracting other interested parties in mind. This is too big to be a feasible single-developer project.

This is a reason that creating developer documentation has a high priority.

Not only coders need apply - I would love to hear what ideas others have about Praxis; possible feature, how things could work/ look, integrations, etc. 

PS: I am kind of new to both GitHub and the Javascript world - I am aware it is very likely that there are better ways of doing things, and suggestions are very welcome :)
