import React, { useContext} from "react";
import SelectionContext from "../context/selectioncontext";
import DataContext from "../context/DataContext";

function Container() {

	const apiData = useContext(DataContext) as DataContext;
	console.log(apiData);
	return <></>
}

export default Container;