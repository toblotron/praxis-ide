
// "Things that should probably be in a better place"

CurrentViewedPageNr = 0;
SwitchingPages = false;
CurrentViewedPage = null;

function ConnectionExists(connection){
    var page = app.getRulePage(CurrentViewedPageNr);
    return page.connections.find(element => element.id == connection.id) != undefined;
};

function FigureExists(shape){
    var page = app.getRulePage(CurrentViewedPageNr);
    return page.shapes.find(element => element.id == shape.id) != undefined;
};

function GetCurrentModelPage(){
    if(CurrentViewedPageNr == undefined)
        CurrentViewedPageNr = 0;
    return app.getRulePage(CurrentViewedPageNr);
};

// the generated code will be in the order that the pages are displayed in the tree
function pagesInTreeOrder()
{
    rulePages = [];
    listPagesRecursive(rulePages, Model.pageIndexTree);
    return rulePages;
}
// help function for above
function listPagesRecursive(pageList, children)
{
    for(var child of children) {
        if(child.type == 'rules' ){
            pageList.push(app.getRulePage(child.index));
        }
        else if(child.type == 'folder')
        {
            listPagesRecursive(pageList, child.children);
        }
    }
}

function getTauPrologLibraries(){
    return [
        /*
        {name:"my_module", external: true, predicates:[
            {
                name:"test",
                arity: 2,
                arguments: [
                    {name: "Num"},
                    {name: "Svar"}
                ],
                description: "Is Num liten or stor?",
                external: true
            }]
        },*/
        {name:"", external: false, predicates:[
            // For now - do not list the builtins - it will mess up the user-space, and there's a heck of a lot of them to write in
            /*{
                name:"call",
                arity: 1,
                arguments: [
                    {name: "Goal"}
                ],
                description: "Invoke a callable term as a goal.",
                external: true
            },
            {
                name:"call",
                arity: 2,
                arguments: [
                    {name: "Goal"},
                    {name: "ExtraArg"}
                ],
                description: "Invoke a callable term as a goal with an extra argument.",
                external: true
            },
            {
                name:"call",
                arity: 3,
                arguments: [
                    {name: "Goal"},
                    {name: "ExtraArg"},
                    {name: "ExtraArg1"}
                ],
                description: "Invoke a callable term as a goal with two extra arguments.",
                external: true
            },
            {
                name:"call",
                arity: 4,
                arguments: [
                    {name: "Goal"},
                    {name: "ExtraArg"},
                    {name: "ExtraArg1"},
                    {name: "ExtraArg2"}
                ],
                description: "Invoke a callable term as a goal with three extra arguments.",
                external: true
            },
            {
                name:"call",
                arity: 5,
                arguments: [
                    {name: "Goal"},
                    {name: "ExtraArg"},
                    {name: "ExtraArg1"},
                    {name: "ExtraArg2"},
                    {name: "ExtraArg3"}
                ],
                description: "Invoke a callable term as a goal with four extra arguments.",
                external: true
            },
            {
                name:"call",
                arity: 6,
                arguments: [
                    {name: "Goal"},
                    {name: "ExtraArg"},
                    {name: "ExtraArg1"},
                    {name: "ExtraArg2"},
                    {name: "ExtraArg3"},
                    {name: "ExtraArg4"}
                ],
                description: "Invoke a callable term as a goal with five extra arguments.",
                external: true
            },
            {
                name:"call",
                arity: 7,
                arguments: [
                    {name: "Goal"},
                    {name: "ExtraArg"},
                    {name: "ExtraArg1"},
                    {name: "ExtraArg2"},
                    {name: "ExtraArg3"},
                    {name: "ExtraArg4"},
                    {name: "ExtraArg5"}
                ],
                description: "Invoke a callable term as a goal with six extra arguments.",
                external: true
            },
            {
                name:"call",
                arity: 8,
                arguments: [
                    {name: "Goal"},
                    {name: "ExtraArg"},
                    {name: "ExtraArg1"},
                    {name: "ExtraArg2"},
                    {name: "ExtraArg3"},
                    {name: "ExtraArg4"},
                    {name: "ExtraArg5"},
                    {name: "ExtraArg6"}
                ],
                description: "Invoke a callable term as a goal with seven extra arguments.",
                external: true
            },
            {
                name:"call",
                arity: 9,
                arguments: [
                    {name: "Goal"},
                    {name: "ExtraArg"},
                    {name: "ExtraArg1"},
                    {name: "ExtraArg2"},
                    {name: "ExtraArg3"},
                    {name: "ExtraArg4"},
                    {name: "ExtraArg5"},
                    {name: "ExtraArg6"},
                    {name: "ExtraArg7"}
                ],
                description: "Invoke a callable term as a goal with eight extra arguments.",
                external: true
            },
            {
                name: "catch",
                arity: 3,
                arguments: [
                    {name: "Goal", mode:"+"},
                    {name: "Catcher", mode:"?"},
                    {name: "Handler", mode:"+"}
                ],
                description: "Enable recovery from exceptions.",
                usage: "catch(Goal, Catcher, Handler) behaves as call/1 if no exception is raised when executing Goal. If an exception is raised using throw/1 while Goal executes, and the Goal is the innermost goal for which Catcher unifies with the argument of throw/1, all choice points generated by Goal are cut, the system backtracks to the start of catch/3 while preserving the thrown exception term, and Handler is called as in call/1.",
                external: true
            },
            {
                name:"fail",
                arity: 0,
                arguments: [],
                description:"Always fail.",
                external: true

            },
            {
                name:"false",
                arity: 0,
                arguments: [],
                description:"Always fail.",
                external: true

            },
            {
                name:"throw",
                arity: 1,
                arguments: [
                    {name: "Exception", mode:"+"}
                ],
                description:"Raise an exception.",
                external: true
            },
            {
                name:"true",
                arity: 0,
                arguments: [],
                description:"Always succeed.",
                external: true
            },
            {
                name:"subsumes_term",
                arity: 2,
                arguments: [
                    {name:"Generic"}, 
                    {name:"Specific"}],
                description:"True if and only if Generic can be turn into Specific just by binding Generic's variables.",
                external: true
            },
            {
                name:"unify_with_occurs_check",
                arity: 2,
                arguments: [
                    {name:"X"}, 
                    {name:"Y"}],
                description:"True if and only if X and Y are unifiable. This predicate carries out standart unification (unification with the occurs.",
                external: true
            }*/
        ]},
        {name:"lists", external: true, predicates:[
            {
                name:"append",
                arity: 3,
                arguments: [
                    {name: "A"},
                    {name: "B"},
                    {name: "AB"}
                ],
                description: "Join two lists."
            },
            {
                name:"append",
                arity: 2,
                arguments: [
                    {name: "A"},
                    {name: "B"}
                ],
                description: "Concatenate a list of lists."
            },
            {
                name: "member",
                arity: 2,
                arguments: [
                    {name: "Elem"},
                    {name: "List"}
                ],
                description: "Check membership of element in list."
            },
            {
                name:"drop",
                arity: 3,
                arguments: [
                    {name: "DropCount"},
                    {name: "List"},
                    {name: "DroppedList"}
                ],
                description:"Drop the first elements of a list."

            },
            {
                name:"last",
                arity: 2,
                arguments: [
                    {name: "List"},
                    {name: "Elem"},
                ],
                description:"Last element of a list."
            },
            {
                name:"length",
                arity: 2,
                arguments: [
                    {name: "List"},
                    {name: "Length"},
                ],
                description:"Length of a list."
            },
            {
                name:"list_to_set",
                arity: 2,
                arguments: [
                    {name: "List"},
                    {name: "Set"},
                ],
                description:"Turn list into set."
            },
            {
                name:"max_list",
                arity: 2,
                arguments: [
                    {name: "List"},
                    {name: "MaxNr"},
                ],
                description:"Largest element of a list."
            },
            {
                name:"min_list",
                arity: 2,
                arguments: [
                    {name: "List"},
                    {name: "MinNr"},
                ],
                description:"Smallest element of a list."
            },
            {
                name:"msort",
                arity: 2,
                arguments: [
                    {name: "List"},
                    {name: "OrderedList"},
                ],
                description:"Check standard order."
            },
            {
                name:"nth0",
                arity: 3,
                arguments: [
                    {name: "Index"},
                    {name: "List"},
                    {name: "Item"}
                ],
                description:"Get the Nth element of a list."
            },
            {
                name:"nth0",
                arity: 4,
                arguments: [
                    {name: "Index"},
                    {name: "List"},
                    {name: "Item"},
                    {name: "Rest"}
                ],
                description:"Get the Nth element of a list and the rest of elements on it."
            },
            {
                name:"nth1",
                arity: 3,
                arguments: [
                    {name: "Index"},
                    {name: "List"},
                    {name: "Item"}
                ],
                description:"Same as nth0/3, but the index count starts at 1."
            },
            {
                name:"nth1",
                arity: 4,
                arguments: [
                    {name: "Index"},
                    {name: "List"},
                    {name: "Item"},
                    {name: "Rest"}
                ],
                description:"Same as nth0/3, but the index count starts at 1."
            },
            {
                name:"permutation",
                arity: 2,
                arguments: [
                    {name: "List"},
                    {name: "PermutateList"}
                ],
                description:"Permutation of list."
            },
            {
                name:"prefix",
                arity: 2,
                arguments: [
                    {name: "PrefixList"},
                    {name: "List"}
                ],
                description:"Get prefixes of list."
            },
            {
                name:"prod_list",
                arity: 2,
                arguments: [
                    {name: "List"},
                    {name: "Prod"}
                ],
                description:"Product of the elements of a list."
            },
            {
                name:"replicate",
                arity: 3,
                arguments: [
                    {name: "Term"},
                    {name: "Times"},
                    {name: "List"}
                ],
                description:"Generate list by replicating an element."
            },
            {
                name:"reverse",
                arity: 2,
                arguments: [
                    {name: "List"},
                    {name: "ReversedList"}
                ],
                description:"Invert the order of the elements in a list."
            },
            {
                name:"select",
                arity: 3,
                arguments: [
                    {name: "Element"},
                    {name: "FirstList"},
                    {name: "SecondList"}
                ],
                description:"Check if two lists differ in one element."
            },
            {
                name:"take",
                arity: 3,
                arguments: [
                    {name: "N"},
                    {name: "List"},
                    {name: "FirstElements"}
                ],
                description:"Retrieve first elements of a list."
            }
        ]},
        {name:"dom", external: true, predicates:[
            {
                name:"add_class",
                arity: 2,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "Atom", mode:"+"}
                ],
                description: "Add class to an HTML element."
            },
            {
                name:"append_child",
                arity: 2,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "ChildHtmlObject", mode:"+"}
                ],
                description: "Insert an HTML element at the end of another."
            },
            {
                name:"attr",
                arity: 3,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "Atom", mode:"+"},
                    {name: "Term", mode:"?"}
                ],
                description: "Read or update an attribute of an HTML element."
            },
            {
                name:"body",
                arity: 1,
                arguments: [
                    {name: "Body", mode:"-"}
                ],
                description: "Get the body of the page."
            },
            {
                name:"create",
                arity: 2,
                arguments: [
                    {name: "Atom", mode:"+"},
                    {name: "HtmlObject", mode:"?"}
                ],
                description: "Create an HTML element or check its tag name."
            },
            {
                name:"document",
                arity: 1,
                arguments: [
                    {name: "Document", mode:"?"}
                ],
                description: "Get the document object."
            },
            {
                name:"get_attr",
                arity: 3,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "Atom", mode:"+"},
                    {name: "Atom", mode:"?"}
                ],
                description: "Get attribute value from HTML object."
            },
            {
                name:"get_by_class",
                arity: 2,
                arguments: [
                    {name: "Atom", mode:"+"},
                    {name: "HtmlObject", mode:"?"}
                ],
                description: "Get HTML elements with the same class."
            },
            {
                name:"get_by_class",
                arity: 3,
                arguments: [
                    {name: "ParentObject", mode:"+"},
                    {name: "Atom", mode:"+"},
                    {name: "HtmlObject", mode:"?"}
                ],
                description: "Get HTML elements with the same class under a parent object."
            },
            {
                name:"get_by_id",
                arity: 2,
                arguments: [
                    {name: "Atom", mode:"+"},
                    {name: "HtmlObject", mode:"?"}
                ],
                description: "Get an HTML element by its id."
            },
            {
                name:"get_by_name",
                arity: 2,
                arguments: [
                    {name: "Atom", mode:"+"},
                    {name: "HtmlObject", mode:"?"}
                ],
                description: "Get HTML elements by their names."
            },
            {
                name:"get_by_tag",
                arity: 2,
                arguments: [
                    {name: "Atom", mode:"+"},
                    {name: "HtmlObject", mode:"?"}
                ],
                description: "Get HTML elements with the same tag."
            },
            {
                name:"get_by_tag",
                arity: 3,
                arguments: [
                    {name: "ParentObject", mode:"+"},
                    {name: "Atom", mode:"+"},
                    {name: "HtmlObject", mode:"?"}
                ],
                description: "Get HTML elements with the same tag under a parent object."
            },
            {
                name:"get_html",
                arity: 2,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "InnerHtml", mode:"?"}
                ],
                description: "Get the HTML inside of an HTML element."
            },
            {
                name:"get_style",
                arity: 3,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "Property", mode:"+"},
                    {name: "Value", mode:"?"}
                ],
                description: "Get the CSS property of an HTML element."
            },
            {
                name:"has_class",
                arity: 2,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "Class", mode:"?"}
                ],
                description: "Check if an HTML element has a certain class."
            },
            {
                name:"head",
                arity: 1,
                arguments: [
                    {name: "HtmlObject", mode:"?"}
                ],
                description: "Get the header of the page."
            },
            {
                name:"html",
                arity: 2,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "Content", mode:"?"}
                ],
                description: "Read or update an HTML element."
            },
            {
                name:"insert_after",
                arity: 2,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "NewHtmlObject", mode:"+"}
                ],
                description: "Insert an HTML element after another."
            },
            {
                name:"insert_before",
                arity: 2,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "NewHtmlObject", mode:"+"}
                ],
                description: "Insert an HTML element before another."
            },
            {
                name:"parent_of",
                arity: 2,
                arguments: [
                    {name: "ChildHtmlObject", mode:"?"},
                    {name: "ParentHtmlObject", mode:"?"}
                ],
                description: "Get HTML parent of an HTML element."
            },
            {
                name:"prepend_child",
                arity: 2,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "NewHtmlObject", mode:"+"}
                ],
                description: "Insert an HTML element at the beginning of another."
            },
            {
                name:"remove",
                arity: 1,
                arguments: [
                    {name: "HtmlObject", mode:"+"}
                ],
                description: "Remove an HTML element."
            },
            {
                name:"remove_class",
                arity: 2,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "ClassNameAtom", mode:"+"}
                ],
                description: "Delete a class from an HTML element."
            },
            {
                name:"set_attr",
                arity: 3,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "Attribute", mode:"+"},
                    {name: "Value", mode:"+"}
                ],
                description: "Set attribute value for HTML object."
            },
            {
                name:"set_html",
                arity: 2,
                arguments: [
                    {name: "HTMLObject", mode:"+"},
                    {name: "InnerHTML", mode:"+"}
                ],
                description: "Set the HTML of an HTML element."
            },
            {
                name:"set_style",
                arity: 3,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "Property", mode:"+"},
                    {name: "Value", mode:"+"}
                ],
                description: "Set the CSS property of an HTML element."
            },
            {
                name:"sibling",
                arity: 2,
                arguments: [
                    {name: "HTMLObjectL", mode:"?"},
                    {name: "HTMLObjectR", mode:"?"}
                ],
                description: "Get an HTML element's sibling."
            },
            {
                name:"style",
                arity: 3,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "Property", mode:"+"},
                    {name: "Value", mode:"?"}
                ],
                description: "Set the CSS property of an HTML element."
            },
            {
                name:"bind",
                arity: 4,
                arguments: [
                    {name: "HtmlObject", mode:"+"},
                    {name: "EventType", mode:"+"},
                    {name: "DOMEventObject", mode:"-"},
                    {name: "Goal", mode:"+"}
                ],
                description: "Bind a certain event to an HTML element."
            },
            {
                name:"event_property",
                arity: 3,
                arguments: [
                    {name: "Event", mode:"+"},
                    {name: "Key", mode:"+"},
                    {name: "Value", mode:"?"}
                ],
                description: "Extract a property's value of an event."
            },
            {
                name:"prevent_default",
                arity: 1,
                arguments: [
                    {name: "DOMEventObject", mode:"+"}
                ],
                description: "Prevent default behaviour in an event."
            },
            {
                name:"unbind",
                arity: 2,
                arguments: [
                    {name: "HTMLObject", mode:"+"},
                    {name: "EventType", mode:"+"}
                ],
                description: "Unbind event linked to an HTML element."
            },
            {
                name:"unbind",
                arity: 3,
                arguments: [
                    {name: "HTMLObject", mode:"+"},
                    {name: "EventType", mode:"+"},
                    {name: "Goal", mode:"?"}
                ],
                description: "Unbind events linked to an HTML element which execute a certain goal."
            },
            {
                name:"hide",
                arity: 1,
                arguments: [
                    {name: "HTMLObject", mode:"+"}
                ],
                description: "Hide an HTML element."
            },
            {
                name:"show",
                arity: 1,
                arguments: [
                    {name: "HTMLObject", mode:"+"}
                ],
                description: "Show an HTML element."
            },
            {
                name:"toggle",
                arity: 1,
                arguments: [
                    {name: "HTMLObject", mode:"+"}
                ],
                description: "Toggle visibility of an HTML element."
            }
        ]},
        {name:"random", external: true, predicates:[
            {
                name:"get_seed",
                arity: 1,
                arguments: [
                    {name: "Seed", mode:"-"}
                ],
                description: "Get seed number."
            },
            {
                name:"maybe",
                arity: 0,
                arguments: [],
                description: "Randomly succeed or fail."
            },
            {
                name:"maybe",
                arity: 1,
                arguments: [
                    {name: "Number", mode:"+"}
                ],
                description: "Succeed with probability Number."
            },
            {
                name:"random",
                arity: 1,
                arguments: [
                    {name: "Random", mode:"-"}
                ],
                description: "Generate random float."
            },
            {
                name:"random",
                arity: 3,
                arguments: [
                    {name: "Begin", mode:"+"},
                    {name: "End", mode:"+"},
                    {name: "Random", mode:"-"}
                ],
                description: "Generate random float/int between Begin and End."
            },
            {
                name:"random_between",
                arity: 3,
                arguments: [
                    {name: "Bottom", mode:"+"},
                    {name: "Top", mode:"+"},
                    {name: "Random", mode:"-"}
                ],
                description: "Generate random int between Top and Bottom."
            },
            {
                name:"random_member",
                arity: 2,
                arguments: [
                    {name: "Elem", mode:"?"},
                    {name: "List", mode:"?"}
                ],
                description: "Elem is a random member of List"
            },
            {
                name:"random_permutation",
                arity: 2,
                arguments: [
                    {name: "List", mode:"?"},
                    {name: "Permutation", mode:"?"}
                ],
                description: "Permutate list randomly"
            },
            {
                name:"set_seed",
                arity: 1,
                arguments: [
                    {name: "Seed", mode:"+"}
                ],
                description: "Set seed number."
            },

        ]},
        {name:"statistics", external: true, predicates:[
            {
                name:"statistics",
                arity: 0,
                arguments: [],
                description: "Display system statistics."
            },
            {
                name:"statistics",
                arity: 2,
                arguments: [
                    {name: "Statistic", mode:"+"},
                    {name: "Value", mode:"-"}
                ],
                description: "Display specific statistic."
            },
            {
                name:"time",
                arity: 1,
                arguments: [
                    {name: "Goal", mode:"+"}
                ],
                description: "Execute goal and print metrics."
            },
        ]},
        {name:"js", external: true, predicates:[
            {
                name:"apply",
                arity: 3,
                arguments: [
                    {name: "Method",mode:"+"},
                    {name: "Arguments",mode:"+"},
                    {name: "Value",mode:"-"}
                ],
                description: "",
                external: true
            },
            {
                name:"apply",
                arity: 4,
                arguments: [
                    {name: "Context",mode:"+"},
                    {name: "Method",mode:"+"},
                    {name: "Arguments",mode:"+"},
                    {name: "Value",mode:"-"}
                ],
                description: "",
                external: true
            },
            {
                name:"global",
                arity: 1,
                arguments: [
                    {name: "Context",mode:"?"}
                ],
                description: "",
                external: true
            },
            {
                name:"json_atom",
                arity: 2,
                arguments: [
                    {name: "JSObject", mode:"+"},
                    {name: "Atom", mode:"-"}
                ],
                description: "Transform a JavaScript object into a Prolog atom."
            },
            {
                name:"json_prolog",
                arity: 2,
                arguments: [
                    {name: "JSObject", mode:"+"},
                    {name: "List", mode:"-"}
                ],
                description: "Transform a JavaScript object into a Prolog list."
            },
            {
                name:"new",
                arity: 3,
                arguments: [
                    {name: "Object", mode:"+"},
                    {name: "Args", mode:"+"},
                    {name: "Value", mode:"-"}
                ],
                description: "Create an instance of a JavaScript object."
            },
            {
                name:"prop",
                arity: 2,
                arguments: [
                    {name: "Property", mode:"+"},
                    {name: "Value", mode:"-"}
                ],
                description: "Get a property of the JavaScript global object."
            },
            {
                name:"prop",
                arity: 3,
                arguments: [
                    {name: "Context", mode:"+"},
                    {name: "Property", mode:"+"},
                    {name: "Value", mode:"-"}
                ],
                description: "Get a property of a JavaScript object."
            },
            {
                name:"ajax",
                arity: 3,
                arguments: [
                    {name: "Method",mode:"+"},
                    {name: "Url",mode:"+"},
                    {name: "Response",mode:"-"}
                ],
                description: "Perform an asynchronous HTTP (Ajax) request.",
                external: true
            },
            {
                name:"ajax",
                arity: 4,
                arguments: [
                    {name: "Method",mode:"+"},
                    {name: "Url",mode:"+"},
                    {name: "Response",mode:"-"},
                    {name: "AjaxOptions",mode:"+"}
                ],
                description: "Perform an asynchronous HTTP (Ajax) request, with options.",
                external: true
            },

        ]},
        {name:"os", external: true, predicates:[
            {
                name:"sleep",
                arity: 1,
                arguments: [
                    {name: "Milliseconds",mode:"+"}
                ],
                description: "sleep(Milliseconds) interrupts execution for Milliseconds milliseconds.",
                external: true
            },
            {
                name:"absolute_file_name",
                arity: 2,
                arguments: [
                    {name: "FileName", mode:"+"},
                    {name:"AbsolutePath", mode:"-"}
                ],
                description: "Expand a local filename into an absolute path.",
                external: true
            },
            {
                name:"delete_directory",
                arity: 1,
                arguments: [
                    {name: "Path",mode:"+"}
                ],
                description: "Remove a directory.",
                external: true
            },
            {
                name:"delete_file",
                arity: 1,
                arguments: [
                    {name: "Path",mode:"+"}
                ],
                description: "Remove a file.",
                external: true
            },
            {
                name:"directory_files",
                arity: 2,
                arguments: [
                    {name: "Path", mode:"+"},
                    {name:"Files", mode:"-"}
                ],
                description: "Get the list of files in a directory.",
                external: true
            },
            {
                name:"exists_directory",
                arity: 1,
                arguments: [
                    {name: "Path",mode:"+"}
                ],
                description: "Check the existence of a directory.",
                external: true
            },
            {
                name:"exists_file",
                arity: 1,
                arguments: [
                    {name: "Path",mode:"+"}
                ],
                description: "Check the existence of a file.",
                external: true
            },
            {
                name:"file_permission",
                arity: 2,
                arguments: [
                    {name: "Path", mode:"+"},
                    {name:"Permissions", mode:"-"}
                ],
                description: "Get the list of files in a directory.",
                external: true
            },
            {
                name:"is_absolute_file_name",
                arity: 1,
                arguments: [
                    {name: "Path",mode:"+"}
                ],
                description: "Check if absolute path name.",
                external: true
            },
            {
                name:"make_directory",
                arity: 1,
                arguments: [
                    {name: "Path",mode:"+"}
                ],
                description: "Create directory.",
                external: true
            },
            {
                name:"pid",
                arity: 1,
                arguments: [
                    {name: "Pid",mode:"+"}
                ],
                description: "n/a",
                external: true
            },
            {
                name:"rename_file",
                arity: 2,
                arguments: [
                    {name: "OldPath", mode:"+"},
                    {name:"NewPath", mode:"+"}
                ],
                description: "Rename a file.",
                external: true
            },
            {
                name:"same_file",
                arity: 2,
                arguments: [
                    {name: "Path1", mode:"+"},
                    {name:"Path2", mode:"+"}
                ],
                description: "Check if two files are the same.",
                external: true
            },
            {
                name:"shell",
                arity: 1,
                arguments: [
                    {name: "Command",mode:"+"}
                ],
                description: "Run a shell command.",
                external: true
            },
            {
                name:"shell",
                arity: 2,
                arguments: [
                    {name: "Command",mode:"+"},
                    {name: "ResponseCode",mode:"-"}
                ],
                description: "Run a shell command.",
                external: true
            },
            {
                name:"size_file",
                arity: 2,
                arguments: [
                    {name: "Path", mode:"+"},
                    {name:"Size", mode:"-"}
                ],
                description: "Get the size of a file.",
                external: true
            },
            {
                name:"time_file",
                arity: 2,
                arguments: [
                    {name: "Path", mode:"+"},
                    {name: "Time", mode:"-"}
                ],
                description: "Last modified time of a file.",
                external: true
            },
            {
                name:"working_directory",
                arity: 2,
                arguments: [
                    {name: "Old", mode:"-"},
                    {name: "New", mode:"+"}
                ],
                description: "Get and update the current working directory.",
                external: true
            },
        ]},
        {name:"format", external: true, predicates:[
            {
                name:"format",
                arity: 2,
                arguments: [
                    {name: "FormatString", mode:"+"},
                    {name: "Arguments", mode:"?"}
                ],
                description: "Output formated string to standard output."
            },
            {
                name:"format",
                arity: 3,
                arguments: [
                    {name: "Stream", mode:"+"},
                    {name: "FormatString", mode:"+"},
                    {name: "Arguments", mode:"?"}
                ],
                description: "Output formated string to the named stream."
            },
            {
                name:"format",
                arity: 4,
                arguments: [
                    {name: "FormatString", mode:"+"},
                    {name: "Arguments", mode:"?"},
                    {name: "LS1", mode:"?"},
                    {name: "LS2", mode:"?"}
                ],
                description: "DCG formating."
            },
        ]},
        {name:"charsio", external: true, predicates:[
            {
                name:"write_term_to_chars",
                arity: 3,
                arguments: [
                    {name: "Term", mode:"+"},
                    {name: "Options", mode:"+"},
                    {name: "CharList", mode:"?"}
                ],
                description: "Write Prolog term to a list of characters."
            }
        ]},
        {name:"concurrent", external: true, predicates:[
            {
                name:"await",
                arity: 2,
                arguments: [
                    {name: "Future", mode:"+"},
                    {name: "Value", mode:"?"}
                ],
                description: "Wait for a Future."
            },
            {
                name:"future",
                arity: 3,
                arguments: [
                    {name: "Template", mode:"?"},
                    {name: "Goal", mode:"+"},
                    {name: "Future", mode:"-"}
                ],
                description: "Make a Future from a Prolog goal"
            },
            {
                name:"future_all",
                arity: 2,
                arguments: [
                    {name: "ListOfFutures", mode:"+"},
                    {name: "FutureAll", mode:"-"}
                ],
                description: "Make a Future that resolves to a list of the results of an input list of futures."
            },
            {
                name:"future_any",
                arity: 2,
                arguments: [
                    {name: "ListOfFutures", mode:"+"},
                    {name: "Future", mode:"-"}
                ],
                description: "Make a Future that resolves as soon as any of the futures in a list succeeds."
            },
            {
                name:"future_done",
                arity: 1,
                arguments: [
                    {name: "Future", mode:"+"}
                ],
                description: "Check if a future finished."
            },
            
        ]}
    ]

}

function ruleDefSetupOnModelLoad(){
    // harvest model ruleDefs
    var modelLibraries = ruleDefHarvestFromModel();
    // add permanent for TauProlog
    // only add those libraries that are inluded in model.settings
    var allTauPrologLibraries = getTauPrologLibraries();

    var tauPrologLibraries = allTauPrologLibraries.filter(l => Model.settings.includedLibraries.includes(l.name));

    // merge the lists - add the harvested ones to the standard ones
    // only add those that are included in model settings
    
    for(lib of modelLibraries){
        // try to find in the standard set
        var libraryDef = tauPrologLibraries.find(l=>l.name == lib.name);
        // only keep harvested libraries if they do not have the same name as a standard library
        if(libraryDef == undefined){    
            tauPrologLibraries.push(lib);
        }
    }
    
    // merge the "" library from tauprolog
    var baseTauLib = allTauPrologLibraries.find(l => l.name == "");
    var baseModelLib = modelLibraries.find(l => l.name == "");
    if(baseTauLib != undefined && baseModelLib != undefined){
        baseTauLib.predicates.forEach(l=>{
            baseModelLib.predicates.push(l);
        });
    }

    // also add the modules from online packages, that we have selected that we want to include
    if(Model.settings.onlinePackages != undefined){
        Model.settings.onlinePackages.forEach(package => {
            package.modules.forEach(module => {
                if(Model.settings.includedLibraries.includes(module.name)){
                    tauPrologLibraries.push(module);
                }
            })
        });
        // ifall man gör som nedan funkar det INTE!.. orättvist!
        /*for(package of Model.settings.onlinePackages){
            for(module of package.modules){
                if(Model.settings.includedLibraries.includes(module.name)){
                    tauPrologLibraries.push(module);
                }
            }
        }*/
    }

    // put it into the model
   app.libraries = tauPrologLibraries;
}


function ruleDefHarvestFromModel(){

    // always include the "" (user) library
    var libraries = [{name:"", external:false, predicates:[]}];

    // gather rulepages in generation-order
    var pages = pagesInTreeOrder();

    // go through them
    for(page of pages){
        for(shape of page.shapes){
            if(shape.type == "RuleShape"){ 
                // should be a rule-head? Gather needed things
                if(incomingArrows(shape, page) == 0){
                    var libName = shape.data.libraryName;
                    if(libName == undefined)
                        libName = "";
                    // do we already have a library for this?
                    var libraryDef = libraries.find(l=>l.name == libName);
                    if(libraryDef == undefined){
                        libraryDef = {name:libName, external:false, predicates:[]};
                        libraries.push(libraryDef);
                    }
                    var ruleName = shape.data.ruleName;
                    var ruleArity = shape.data.arguments.length;
                    // do we already have a rule registered for this?
                    var ruleDef = libraryDef.predicates.find(r=>r.name == ruleName && r.arity == ruleArity);
                    if(ruleDef == undefined){
                        ruleDef = {name:ruleName, arity:ruleArity, references:[]};
                        libraryDef.predicates.push(ruleDef);
                    }
                    // add reference to this specific rule
                    var ruleRef = {page: page.id, shape: shape.id};
                    ruleDef.references.push(ruleRef);
                }
            }
            // dcg rules are added a bit differently
            // they form rules inside the same libraries as normal rules, but add isDcg = true
            if(shape.type == "DcgShape"){ 
                // should be a rule-head? Gather needed things
                if(incomingArrows(shape, page) == 0){
                    var libName = shape.data.libraryName;
                    if(libName == undefined)
                        libName = "";
                    // do we already have a library for this?
                    var libraryDef = libraries.find(l=>l.name == libName);
                    if(libraryDef == undefined){
                        libraryDef = {name:libName, external:false, predicates:[]};
                        libraries.push(libraryDef);
                    }
                    var ruleName = shape.data.ruleName;
                    var ruleArity = shape.data.arguments.length;
                    // do we already have a rule registered for this?
                    var ruleDef = libraryDef.predicates.find(r=>r.name == ruleName && r.arity == ruleArity && r.isDcg != undefined);
                    if(ruleDef == undefined){
                        ruleDef = {name:ruleName, arity:ruleArity, isDcg:true, references:[]};
                        libraryDef.predicates.push(ruleDef);
                    }
                    // add reference to this specific rule
                    var ruleRef = {page: page.id, shape: shape.id};
                    ruleDef.references.push(ruleRef);
                }
            }
        }
    }

    return libraries;
}


// return incoming arrows to shape
function incomingArrows(shape, page){
    var count = 0;
    for(var connection of page.connections) {
        // for logic-connectors it is counted as incoming even if the arrow was drawn from
        // the lower in to the higher out - since we do not display actual direction for these, drawn directions should not matter
        if( connection.target.shape == shape.id && connection.target.role == "in" || 
            connection.source.shape == shape.id && connection.source.role == "in")
            count++;
    }
    return count;
}

// return all shapes pointed at by this shape (with if-then/else-connections)
// + in left-to-right order
function shapeTargets(shape, pc, connectionRole){
    var targets = [];
    for(var connection of pc.page.connections) {
        if(connection.role == connectionRole && 
            (
                // for logic connections, connection direction should not matter
                connection.source.shape == shape.id && connection.source.role == "out" ||
                connection.target.shape == shape.id && connection.target.role == "out"
            )
        ){
            // return the other shape the connection is involved with - not the source-shape :)
            target = pc.page.shapes.find(sh => (sh.id == connection.target.shape || sh.id == connection.source.shape) && sh.id != shape.id);
            targets.push(target);
        }
    }
    return targets.sort(compareXPos);;
}

// returns array of code for all targets (pointed-at shapes)
function parseTargetCodes(shape, pc){
    var targets = shapeTargets(shape, pc, "true");
    var targetCodes = [];
    for(var target of targets) {
        var code = pb[target.type].renderFull(target, pc);
        targetCodes.push(code);
    }
    return targetCodes;
}

// returns array of code for all else-targets (pointed-at shapes, with else-connections)
function parseElseCodes(shape, pc){
    var targets = shapeTargets(shape, pc, "false");
    var targetCodes = [];
    for(var target of targets) {
        var code = pb[target.type].renderFull(target, pc);
        targetCodes.push(code);
    }
    return targetCodes;
}

/*
 testCode is the code of the shape itself - for example a ruleshape
 trueCode is what should happen if the test is true
 falseCode is what should happen otherwise - the thing that the else-arrow points at
*/
function buildIfThenElse(testCode, trueCodeArray, falseCodeArray, pc){
    var res = "(" + testCode + "\n" + 
        pc.indentation + "->\n";
    if(trueCodeArray.length > 0){
        res += pc.indentation + "(\n";
        res += pc.indentation + trueCodeArray.join(",\n");
        res += pc.indentation + ")\n"
    } else {
        res += pc.indentation + "true\n";    // TODO: does this make sense? - no true-condition means success, in this case :)
    }
    res += pc.indentation + ";\n";
    res += pc.indentation + "(\n";
    res += pc.indentation + falseCodeArray.join(",\n");
    res += pc.indentation + ")\n";

    return res + ")";
}


function parseContainedCodes(containedIds, pc){
    var targets = [];
    for(var childId of containedIds) {
        target = pc.page.shapes.find(sh => sh.id == childId && incomingArrows(sh,pc.page) == 0);
        if(target != undefined) // if has no incoming arrows
            targets.push(target);
    }
    targets = targets.sort(compareXPos);;
    var targetCodes = [];
    for(var target of targets) {
        var code = pb[target.type].renderFull(target, pc);
        targetCodes.push(code);
    }
    return targetCodes;
}


function tablesInTreeOrder()
{
    tables = [];
    listTablesRecursive(tables, Model.pageIndexTree);
    return tables;
}
// help function for above
function listTablesRecursive(tableList, children)
{
    for(var child of children) {
        if(child.type == 'table' ){
            tableList.push(app.getDataTable(child.index));
        }
        else if(child.type == 'folder')
        {
            listTablesRecursive(tableList, child.children);
        }
    }
}

function getContainer(shape, pc){
    var res = pc.page.shapes.find(sh => sh.type == "GroupShape" && sh.data.contained.includes(shape.id));
    return res;
}

function generateAST()
{
    // update contained of all Group figures
    updateAllGroupsContained(app.view);

    // gather all rules, grouped by name/arity
    //...
     
    var pages = pagesInTreeOrder();
    for(var page of pages){
        var parsingContext = {};
        parsingContext.page = page;
        
        // sort all shapes, to ensure left-to-right-order of rules
        var shapes = page.shapes.sort(compareXPos);
        for(var shape of shapes){
            parsingContext.shape = shape;
            if(pb[shape.type].shouldStartRule(shape, parsingContext))
                res = res + pb[shape.type].startParseRule(shape, parsingContext);
        }
    }
}


function generateCode()
{
    // update contained of all Group figures
    updateAllGroupsContained(app.view);
    var res = "";
    
    // include all included libraries
    for(lib of Model.settings.includedLibraries){
        res += ":- use_module(library(" + lib + ")).\n";
    }
    res += "\n";

    // declare dynamics
    for(signature of Model.settings.dynamic){
        res += ":- dynamic(" + signature + ").\n";
    }
    res += "\n";

    var pages = pagesInTreeOrder();
    for(var page of pages){
        var parsingContext = {};
        parsingContext.page = page;
        
        // sort all shapes, to ensure left-to-right-order of rules
        var shapes = page.shapes.sort(compareXPos);
        for(var shape of shapes){
            parsingContext.shape = shape;
            if(pb[shape.type].shouldStartRule(shape, parsingContext))
                res = res + pb[shape.type].startParseRule(shape, parsingContext);
        }
    }

    // table data
    var tables = tablesInTreeOrder();
    var tableCode = "";
    for(var table of tables){
        tableCode += pb.generateTableCode(table);
    }
    res = res + tableCode;

    return res
}


function compareXPos( a, b ) {
    if ( a.x < b.x ){
      return -1;
    }
    if ( a.x > b.x ){
      return 1;
    }
    return 0;
  }

function updateAllGroupsContained(view){
    var page = app.getRulePage(CurrentViewedPageNr);
    if(page != undefined){
        for(var shape of page.shapes) {
            if(shape.typeName == "GroupFigure"){
                // find the actual instance, on the page
                figure = view.figures.data.find(fig => fig.id == shape.id);
                if(figure != undefined)
                    figure.gatherContained(); 
            }
        };
    }
}

// escape things in prolog code so it can be displayed as HTML
function htmlPrologEncode(prologText){
    var str = prologText.replaceAll("\"", "&quot;");
    return str;
}

// change escaped prolog-code back to unescaped, for storage and processing
function htmlPrologDecode(htmlText){
    var str = htmlText.replaceAll("&quot;","\"");
    return str;
}

// escape things in prolog code so it can be displayed as HTML
function svgPrologEncode(prologText){
    //var str = JSON.stringify(prologText);
    var str = prologText; //.replaceAll("\"", "&quot;");
    return str;
}


// check rule data before change, and after. Possibly delete old definition, if there is relevant change
// if ruleShape should cause a rule definition, add it
// if there is no newData, it means that we just want to delete the old rule (def)
// is
function ruleDefTrySubmitRule(shape, newData, isDcg){
    
    var page = GetCurrentModelPage();

    // do none of these things, if shape is not currently classed as a rule-head
    if(incomingArrows(shape, page) == 0){
        
        // delete old ref, if any, or exit if no changes
        
        var oldData = app.view.getShapeModel(shape.id).data; //shape.userData;
        if(newData != undefined && 
            newData.libraryName == oldData.libraryName && 
            newData.ruleName == oldData.ruleName && 
            newData.arguments.length == oldData.arguments.length){
            // no relevant changes in shape data - return
            return;
        } else {
            // there are relevant changes! (or at least, an incoming old rule that should be deleted) - delete old ref, before adding new one! (if old ref can be found)
            var libName = oldData.libraryName;
            if(libName == undefined)
                libName = "";
            // do we have a library for this?
            var libraryDef = app.libraries.find(l=>l.name == libName);
            if(libraryDef != undefined && !libraryDef.external){    // don't handle references for external libraries
                var ruleName = oldData.ruleName;
                var oldIsDcg = oldData.isDcg;
                var ruleArity = oldData.arguments.length;
                // do we have a rule registered for this?
                var ruleDef = libraryDef.predicates.find(r=>r.name == ruleName && r.arity == ruleArity && 
                    r.isDcg == oldIsDcg // check isDcg demand
                );
                if(ruleDef != undefined && ruleDef.external != true){ // dont deal with externally defined rules
                    // find reference, and delete it
                    var ruleRef = ruleDef.references.find(s=>s.shape == shape.id);
                    if(ruleRef != undefined)
                    {
                        var index = ruleDef.references.findIndex(s=>s.shape == shape.id);
                        ruleDef.references.splice(index,1);
                    }
                    // delete rule def from library, if no more references in it
                    if(ruleDef.references.length == 0){
                        var index = libraryDef.predicates.findIndex(r=>r.name == ruleName && r.arity == ruleArity && r.isDcg == oldIsDcg);
                        libraryDef.predicates.splice(index,1);
                        
                        // delete library, if no more rules in it
                        if(libraryDef.predicates.length == 0){
                            var index = app.libraries.findIndex(l=>l.name == libName);
                            app.libraries.splice(index,1);
                        }
                    }
                }

                
            }
        }


        if(newData != undefined){
            // yes, this shape starts a rule definition.. and there is a new version of rule data (= we don't just want to delete old ruledef)
            var libName = newData.libraryName;
            if(libName == undefined)
                libName = "";
            // do we already have a library for this?
            var libraryDef = app.libraries.find(l=>l.name == libName);
            if(libraryDef == undefined){
                libraryDef = {name:libName, external:false, predicates:[]};
                app.libraries.push(libraryDef);
            }

            if(!libraryDef.external){  // don't handle rulerefs for external libraries
                var ruleName = newData.ruleName;
                var ruleArity = newData.arguments.length;
                // do we already have a rule registered for this?
                var ruleDef = libraryDef.predicates.find(r=>r.name == ruleName && r.arity == ruleArity && r.isDcg == isDcg);
                if(ruleDef == undefined){
                    ruleDef = {name:ruleName, arity:ruleArity, references:[]};
                    if(isDcg)
                        ruleDef.isDcg = true;
                    libraryDef.predicates.push(ruleDef);
                }
                // apparently references Can be undefined, here..
                if(ruleDef.references == undefined){
                    ruleDef.references = [];
                }
                // don't add again
                var existingRef = ruleDef.references.find(s=>s.shape == shape.id);
                if(existingRef == undefined){
                    // add reference to this specific rule
                    var ruleRef = {page: page.id, shape: shape.id};
                    ruleDef.references.push(ruleRef);
                }
            }
        }
    }
}

// For Html-appropriate escaping of chars
function escapeHtml(unsafe) {
	return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

