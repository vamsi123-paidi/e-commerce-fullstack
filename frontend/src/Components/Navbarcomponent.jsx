import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Cart } from 'react-bootstrap-icons';
import { clearCart,setCart } from '../Redux/productsSlice';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'; 
import "../App.css";

const categories = [
  'Beauty', 'Fragrances', 'Furniture', 'Groceries',
  'Laptops', 'Motorcycle', 'Smartphones',
  'Sunglasses', 'Tablets', 'Tops', 'Vehicle'
];

const Navbarcomponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.products.cart);
  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setErrorState = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000); 
  };

  const authenticateUser = async (url, data) => {
    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (err) {
      setErrorState(err.response?.data?.message || 'An error occurred. Please try again later.');
      throw err;
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setErrorState('All fields are required.');
      return;
    }

    const response = await authenticateUser('http://localhost:5000/auth/register', formData);
    alert(response.message);
    setIsLogin(true); 
    setFormData({ name: '', email: '', password: '' });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setErrorState('Email and password are required');
      return;
    }
  
    try {
      const response = await authenticateUser('http://localhost:5000/auth/login', formData);
  
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.userId);
  
      const cartData = JSON.parse(localStorage.getItem('cart')) || [];
  
      dispatch(setCart(cartData));
  
      setShowModal(false);
  
    } catch (error) {
      console.error('Login failed:', error);
      setErrorState('Login failed. Please try again.');
    }
  };
  

  const handleLogout = async () => {
    // Check cart data
    console.log('Cart Data on Logout:', cart);
  
    // Store cart data in localStorage
    const cartData = JSON.stringify(cart);
    localStorage.setItem('cart', cartData);
  
    // Logout logic
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    dispatch(clearCart()); // Clear Redux cart state
  };
  

  return (
    <>
      <Navbar expand="lg" className="bg-dark text-white mb-3 fixed-top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="text-white">OfferZone Shopping</Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
            className="bg-dark text-white"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link as={Link} to="/" className="text-white">Home</Nav.Link>
                <NavDropdown title="Categories" id="navbarScrollingDropdown" className="dropdown-title">
                  {categories.map((category) => (
                    <NavDropdown.Item
                      as={Link}
                      key={category}
                      to={`/products/${category.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-dark"
                    >
                      {category}
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
                <Nav.Link as={Link} to="/cart" className="position-relative text-white">
                  <Cart size={24} aria-label="Cart" />
                  {totalItemsInCart > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {totalItemsInCart}
                      <span className="visually-hidden">unread messages</span>
                    </span>
                  )}
                </Nav.Link>
                {!localStorage.getItem('token') ? (
                  <Nav.Link onClick={() => setShowModal(true)} className="text-white">
                    Login / Register
                  </Nav.Link>
                ) : (
                  <Nav.Link onClick={handleLogout} className="text-white">
                    Logout
                  </Nav.Link>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isLogin ? 'Login' : 'Register'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form>
            {!isLogin && (
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={isLogin ? handleLogin : handleRegister}
              className="w-100"
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            <p className='text-center'>{isLogin ? "Don't have an account? Register" : "Already have an account? Login"}</p>
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Navbarcomponent;
