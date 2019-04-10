import Typography from "typography"
import OceanBeach from 'typography-theme-ocean-beach'

// Wordpress2016.overrideThemeStyles = () => {
//   return {
//     "a.gatsby-resp-image-link": {
//       boxShadow: `none`,
//     },
//   }
// }

OceanBeach.baseFontSize = '18.5px'
OceanBeach.baseLineHeight = '1.58'
OceanBeach.boldWeight = '600'
OceanBeach.bodyColour = 'FFFFFF'
OceanBeach.bodyFontFamily = ['Open Sans']

delete OceanBeach.googleFonts

const typography = new Typography(OceanBeach)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
