import { Observable, firstValueFrom } from 'rxjs'

export default async function getVideoDataFromUrl(url) {
  const videoId = parseYoutubeUrl(url)

  if (!videoId) return false

  let videoData = await firstValueFrom(getVideoData$(videoId)) // await video data

  console.log(
    '🚀 ~ file: youtube.js ~ line 12 ~ getVideoDataFromUrl ~ videoData',
    videoData
  )

  return videoData
}

function getVideoData$(ytId) {
  return new Observable(observer => {
    let embed = document.createElement('iframe')

    embed.setAttribute(
      'src',
      `https://www.youtube.com/embed/${ytId}?enablejsapi=1&widgetid=99`
    )
    embed.cssText = 'position: absolute; display: none'

    embed.onload = function () {
      var message = JSON.stringify({
        event: 'listening',
        id: 99,
        channel: 'widget'
      })

      embed.contentWindow.postMessage(message, 'https://www.youtube.com')
    }

    function parseData(e) {
      const { event, id, info } = JSON.parse(e.data)

      // console.log(JSON.parse(e.data))
      if (event === 'initialDelivery' && id == 99) observer.next(info.videoData)
    }

    document.body.appendChild(embed) // load iframe
    window.addEventListener('message', parseData) // add Api listener for initialDelivery

    return function cleanup() {
      window.removeEventListener('message', parseData)
      document.body.removeChild(embed)
    }
  })
}

export function parseYoutubeUrl(url) {
  var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
  let urlMatch = url.match(p)

  if (urlMatch) return urlMatch[1]

  return false
}
