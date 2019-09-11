/*
** @param opacity {float} (0.0 -> 1.0)
** @description opacity
*/
const opacity = 0.25;

/*
** @param colors {object}
** @description color collection used in app in rgba format
*/
const colors = {
  red:"rgba(255,0,0," + opacity +")",
  green:"rgba(0,255,0," + opacity +")",
  blue:"rgba(0,0,255," + opacity +")",
  purple:"rgba(255,0,255," + opacity +")",
  yellow:"rgba(255,255,0," + opacity +")",
  cyan:"rgba(0,255,255," + opacity +")",
  black:"rgba(0,0,0," + opacity +")",
  white:"rgba(255,255,255," + opacity +")",
  joystick:{
    base:"rgba(0,0,0," + opacity +")",
    dust:"rgba(0,0,0," + opacity +")",
    stick:"rgba(204,204,204,1)",
    ball:"rgba(255,255,255,1)"
  }
}

module.exports = {
  colors
}
