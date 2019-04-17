import React from "react"
import { Link } from "gatsby"
import { rhythm, scale } from "../utils/typography"

import "../global.css"

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props
    const rootPath = `${__PATH_PREFIX__}/`
    let header

    if (location.pathname === rootPath) {
      header = (
        <h1
          style={{
            ...scale(1.5),
            marginBottom: rhythm(1.5),
            marginTop: 0,
          }}
          className="siteHeader"
        >
          <Link
            className="titleLink"
            to={`/`}
          >
            {title}
          </Link>
        </h1>
      )
    } else {
      header = (
        <h3
          style={{
            marginTop: 0,
          }}
          className="siteHeader"
        >
          <Link
            className="titleLink"
            to={`/`}
          >
            {title}
          </Link>
        </h3>
      )
    }
    return (
      <div className="container">
        <header>{header}</header>
        <main className="main">{children}</main>
        <footer className="site-footer">
          <span>{new Date().getFullYear()} Zaymon Foulds-Cook :></span>
          <div className="site-footer--lower">
            <span><small>This site has <a href="https://github.com/gatsbyjs/gatsby">Gatsby</a> bones</small></span>
          </div>
        </footer>
      </div>
    )
  }
}

export default Layout
