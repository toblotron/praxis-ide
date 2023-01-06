var pl;
(function( pl ) {
    // Name of the module
    var name = "my_module";
    // Object with the set of predicates, indexed by indicators (name/arity)
    var predicates = function() {
        return {
            "test/2": [new pl.type.Rule(new pl.type.Term("test",
                [new pl.type.Var("A"),new pl.type.Var("Svar")
                ]), new pl.type.Term(";",
                [new pl.type.Term("->",
                    [new pl.type.Term(",",
                        [new pl.type.Term("<",
                            [new pl.type.Var("A"),new pl.type.Num(1, false)
                            ]),new pl.type.Term("=",
                            [new pl.type.Var("Svar"),new pl.type.Term("litet",
                                [])
                            ])
                        ]),new pl.type.Term("true",
                        [])
                    ]),new pl.type.Term(";",
                    [new pl.type.Term("->",
                        [new pl.type.Term("=",
                            [new pl.type.Var("Svar"),new pl.type.Term("stort",
                                [])
                            ]),new pl.type.Term("true",
                            [])
                        ]),new pl.type.Term("false",
                        [])
                    ])
                ]))
            ]
        };
    };
    // List of predicates exported by the module
    var exports = [
        "test/2"
    ];
    // DON'T EDIT
    if( typeof module !== 'undefined' ) {
        module.exports = function(tau_prolog) {
            pl = tau_prolog;
            new pl.type.Module( name, predicates(), exports );
        };
    } else {
        new pl.type.Module( name, predicates(), exports );
    }
})( pl );
