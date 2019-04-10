/**
 * Bio component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from "react"
import { StaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import "./bio.css"

function Bio() {
  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author, social } = data.site.siteMetadata
        return (
          <div className="bio">
            <Image
              fixed={data.avatar.childImageSharp.fixed}
              alt={author}
              className="bioImage"
            />
            <p>
              <div>
                Articles and Musings by {author} ⚡️
                {` `}
                <br/>
                <a href={`https://github.com/ZaymonFC`}>Github</a> <span> </span>
                <a href={`https://twitter.com/${social.twitter}`}>Twitter</a>
              </div>
            </p>
          </div>
        )
      }}
    />
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/profile-pic.png/" }) {
      childImageSharp {
        fixed(width: 50, height: 50) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    site {
      siteMetadata {
        author
        social {
          twitter
        }
      }
    }
  }
`

export default Bio
