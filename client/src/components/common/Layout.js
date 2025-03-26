// client/src/components/common/Layout.js
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import styled from "styled-components";

const Main = styled.main`
  min-height: 100vh;
  width: 100%;
`;

const Layout = ({ children, hideFooter }) => {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      {!hideFooter && <Footer />}
    </>
  );
};

export default Layout;
