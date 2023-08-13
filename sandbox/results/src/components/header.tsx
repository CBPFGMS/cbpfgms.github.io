import { ReactComponent as Ochalogo } from "../assets/ocha-lockup-blue.svg";
import "../styles/header.css";

function Header() {
	return (
		<div className="wrapper">
			<div className="header">
				<Ochalogo height="50%" />
			</div>
		</div>
	);
}

export default Header;
