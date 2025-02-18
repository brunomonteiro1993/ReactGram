import './NavBar.css'

//components
import { NavLink, Link } from "react-router-dom";
import {
    BsSearch,
    BsHouseDoorFill,
    BsFillPersonFill,
    BsFillCameraFill,
} from "react-icons/bs";

// Hoks
// import { useState } from "react";
// import { useAuth } from "../hooks/useAuth";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

//redux
// import { logout, reset } from "../slices/authSlice";


const Navbar = () => {
    return (
        <nav id="nav">
            <Link to="/">ReactGram</Link>
            <form id='search-form'>
                <BsSearch />
                <input type="text" />
            </form>
            <ul id="nav-links">
                <li>
                    <NavLink to="/">
                        <BsHouseDoorFill />
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/login">
                        Entrar
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/register">
                        Cadastrar
                    </NavLink>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar