import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AdminAccount from './components/AdminAccount';

function App() {
  return <Router>
    <Switch>
      <Route path="/account">
        <AdminAccount></AdminAccount>
      </Route>

      <Route path="/oauth_callback">
        <AdminAccount></AdminAccount>
      </Route>


      <Router path="/">
        <AdminAccount></AdminAccount>
      </Router>
    </Switch>
  </Router>
}

export default App;
