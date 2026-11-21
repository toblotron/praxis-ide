:- module(atts, [
		praxis_array_update/3,
		praxis_array_update_2/4,
		praxis_array_in/3,
		praxis_field_in/2,
		praxis_type_in/2,
		praxis_match_class/2,
		praxis_field_update/3,
		praxis_find_subclass/2,
		praxis_array_update_in/3,
		praxis_class_update/3,
		praxis_field_update_in/2,
		close_list/1,
		close_list/2
	]).

:- use_module(library(lists)).

praxis_array_update(Value,Old,Index,New):-
	(
		nonvar(Index),
		praxis_array_update_2(Value,Old,Index,New),
		write(nonvar : New)
		-> true ;
		(
			append(Old,[Value],New),
			write(var : New)
			-> true ; false
		)
	).
praxis_array_update_2(Value,[_ | OldRest],0,[Value | OldRest]).
praxis_array_in(Value,Index,List):-
	nth0(Index,List,Value).
praxis_array_update_2(Value,OldList,Index,[Value]):-
	(
		OldList = []
		;
		Index < 0
	).
praxis_field_in(Key : Value,List):-
	member(Key : TValue,List),
	!,
	TValue = Value.
praxis_type_in(SuperClass,Object):-
	praxis_match_class(SuperClass,ClassName),
	praxis_field_in(type : ClassName,Object).
praxis_array_update_2(Value,[Old | OldRest],Index,[Old | NewRest]):-
	Index2 is Index - 1,
	praxis_array_update_2(Value,OldRest,Index2,NewRest).
praxis_match_class(Superclass,Response):-
	once((
		(
			Response = Superclass
			;
			praxis_find_subclass(Superclass,Subclass),
			praxis_match_class(Subclass,Response)
		)
	)).
praxis_field_update([],Entry,[Entry]).
praxis_field_update([K : _ | Rest],K : V,[K : V | Rest]).
praxis_field_update([K1 : V1 | Rest],K2 : V2,[K1 : V1 | NewRest]):-
	K1 \= K2,
	praxis_field_update(Rest,K2 : V2,NewRest).
praxis_find_subclass(Superclass,Subclass):-
	praxis_classInfo(Properties),
	praxis_field_in(type : class,Properties),
	praxis_field_in(superClass : Superclass,Properties),
	praxis_field_in(name : Foundclass,Properties),
	(
		Subclass = Foundclass
		;
		praxis_find_subclass(Foundclass,Subclass)
	).

praxis_array_update_in([],Index,_):-
	var(Index).
praxis_array_update_in(Value,Index,List):-
	write(var_in : Value : Index : List),
	nth0(Index,List,Value).
praxis_class_update(ClassName,[],[type : ClassName]).

praxis_field_update_in(Key : Value,List):-
	member(Key : TValue,List),
	!,
	TValue = Value.
praxis_class_update(ClassName,Object,Updated):-
	praxis_field_in(type : InstanceClass,Object),
	once((
		(
			InstanceClass = ClassName
			;
			(
				praxis_find_subclass(InstanceClass,ClassName)
				;
				praxis_find_subclass(ClassName,InstanceClass)
			)
		)
	)),
	praxis_field_update(Object,type : ClassName,Updated),
	!.
praxis_field_update_in(_ : [],_).
close_list([]):-
	!.
close_list([_ | R]):-
	close_list(R).
close_list([],[]).
close_list([_ | R],[_ | L]):-
	close_list(R,L).