// ensures that if the window protocol is https the url protocol is set to https
const ensureCorrectProtocol = (url: string, win?: Window) => {
  try {
    const parsedUrl = new URL(url)

    if ((win || window).location.protocol === "https:") {
      parsedUrl.protocol = "https:"
    }

    return parsedUrl.toString()
  } catch (e) {
    return url
  }
}

export default ensureCorrectProtocol