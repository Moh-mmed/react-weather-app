import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./ErrorPage.css"
const ErrorPage = () => {
  let navigate = useNavigate()
  setTimeout(()=>navigate('/'),2000)
  return <div>Error</div>;
};

export default ErrorPage;
