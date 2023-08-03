# About
Praxis is/ strives to become, an online IDE for visual programming in Prolog. It is (currently) a 100% in-browser application, meaning that there is no component running on any server. -You can just download the repo and run it from your local file system, without any build-steps or other preparations.

Server component will be added as an optional feature in the future (for example, allow users to log in and store their models online, for easy sharing and integration/ publishing), but I will strive to maintain the advantage of having a system that is useful also without any specific server running.

Praxis uses Tau-Prolog to allow you to run/ test models in the browser.

![An image of a Praxis example](https://github.com/toblotron/Trafo/blob/master/familybanner.png?raw=true)

Released under the MIT license.

<h6>Online Tutorials</h6>

* [Praxis 101: Bonus calculation rule](https://scribehow.com/shared/Praxis_101_Bonus_calculation_rule__PTACcEAQQfiE-CbNRD9lxQ)
* [General Fizzbuzz](https://scribehow.com/shared/General_fizzbuzz_in_Praxis__4TkSwFEnRiyDpShV4va-pQ)


<details><summary><b>Brief instructions for using the IDE</b></summary

A Praxis "model" is the same as the entire project - it's what we will load, save and edit with the Praxis IDE.

<h6>General about the UI</h6>

* Add/ delete/ rename project pages/ tables/ folders by right-clicking a node in the tree-menu, and selecting the appropriate action
* Reorder nodes in the tree-menu by drag-and-drop
* Click any item in the tree-menu to view and edit it.
* Load and Save models to your local machine, with the Upload and Download buttons on the top right
* You can hide/show the different panels that make up the UI, by clicking on their (darker) mid-bar, or by using Ctrl-ArrowButtons.

<h6>Model creation and Settings</h6>

* Create a new model by loading/ reloading the page - you will arrive at the "Settings" page
* Give the model a name in the Name box (will decide file-name)
* Under "Standard Tau-Prolog libraries", mark the ones you want to use
* When on another page, reach this "Settings"-page by clicking the project name-node in the tree-menu

<h6>Editing drawings</h6>

* Create a new drawing-page by right-clicking its desired location in the tree-menu, and selecting "Add rules page" (the select the page in the tree, if not already done)
* Drag shapes from the palette, and edit their contents in the side-panel
* Click empty space to deselect shape, and view palette
* Connect shapes by dragging from their bottom, to the top of the shape you want to be evaluated afterwards
* Toggle connection function between "AND THEN" and "OR ELSE" by right-clicking them
* Delete shapes and connections by marking them and pressing Delete
* Mark one/several shapes and copy/ paste them, with Ctrl-C and Ctrl-V
* Pan by moving the mouse with RMB (Right Mouse Button) pressed
* Zoom by rolling the mouse-wheel with RMB pressed

<h6>Executing rules</h6

* Select the Test-tab in the bottom panel
* Enter a query and press Query, in order to execute that query. A query must end with a "." (full stop)
* Press Next to see if there is more than one possible result
* Press Reset to compile/ recompile your code from the model - <b>OTHERWISE</b> you will not get your updated code from changes in the model(!)
* Set Execution limit to decide how many levels of calls you want to allow (limits the risk of endless recursions)

<h6>Editing tables</h6>

* Create a new table by right-clicking its desired location in the tree-menu, and selecting "Add data table" (the select the table in the tree, if not already done)
* Give the table a better name than the default-generated one, in the side panel (best if this is a Prolog Atom - starts with lowercase letter, containing only alphanumeric characters or "_" (underscore))
* Decide what number of columns you want, with the [+] and [-] buttons
* Decide data-type for each column, and give them good names
* Add new row by adding something in the lowermost row, and pressing Return
* If you change the number of columns in a table that you are using in a drawing, you must go to the table-referring shape, select it and press Ok to get the new (correct) number of columns.

<h6>Files</h6>

* Load and Save models to your local machine, with the Upload and Download buttons on the top right
* Download Prolog code / Tau-Prolog js-package generated from your model, by going to the Files-tab in the bottom panel, and clicking "Download" (Prolog code) or "Download module" (Tau-Prolog js-package)

</details>

## Current state
Version 0.1.0 is available to run here, in your browser: https://toblotron.com/praxis/0.1.0/

### You can
* **Create models**, and store them locally on your on machine.
* **Draw rules** (using shapes representing different Prolog statements)
* **Edit tabular** data in Excel-like pages.
* **Run / ask** questions to your model, directly in the browser.
* **Import libraries** (WIP) from URL's, and use the (Tau-Prolog) code therein. 

## Goals for next version (0.2.0)
* **Introduction of pratt-parser**, and generation of an intermediate Abstract Syntax Tree before code generation, allowing better control over parsing and generation of error-messages. (60% ready)
* **Handling schema-defined types**, (editing, importing from schema, using specialized shapes to process structured data) allowing handy integration of your logic models through (for example) a REST-service interface. (10% ready)
* **Creating developer documentation**, for easier understanding of what the system is and how the different parts work together. Documentation is kind of a thing of mine, so I am ambitious about this. (20% ready)

## Praxis website
Praxis is hosted on https://toblotron.com/praxis/ - it contains a [resource overview page](https://toblotron.com/praxis/), [the web-app](https://toblotron.com/praxis/0.1.0/) and a [blog](https://toblotron.com/blog/) where interesting developments are sometimes announced.

## Installation

You do not need to install the Praxis IDE - either run it in the browser, or download this repo and run it from your local machine. It's that simple.

## Contributions

Contributions are very welcome - in fact, version 0.1.0 has been developed with the goal of attracting other interested parties in mind. This is too big to be a feasible single-developer project.

This is a reason that creating developer documentation has a high priority.

Not only coders need apply - I would love to hear what ideas others have about Praxis; possible feature, how things could work/ look, integrations, etc. 

PS: I am kind of new to both GitHub and the JavaScript world - I am aware it is very likely that there are better ways of doing things, and suggestions are very welcome :)
