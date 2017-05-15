import re

from imgurpython.helpers.error import ImgurClientError

from dankbot import imgur


def fix_imgur_url(url):
    if re.search("https?://(.+\.)?imgur.com", url):
        # is imgur!
        if not re.search("\.(gif|png|jpe?g)$", url):
            # Doesn't finish by gif or png or jpe?g
            id_search = re.search("/(\w+(?=[^/]*$))", url)
            if id_search:
                # check if album
                imgur_id = id_search.group(1)
                worked = False
                image = None
                if re.search("https?://(.+\.)?imgur.com/(a|gallery)/", url):
                    try:
                        album = imgur.get_album(imgur_id)
                        if hasattr(album, 'images') and len(album.images) >= 1:
                            image = album.images[0]
                            worked = True
                        else:
                            return ""
                    except ImgurClientError:
                        pass
                if not worked:
                    image = imgur.get_image(imgur_id)

                if image is not None:
                    if hasattr(image, 'mp4'):
                        return image.mp4
                    elif hasattr(image, 'gif'):
                        return image.gif
                    if not hasattr(image, 'link'):
                        return image.get('link')
                    return image.link

    gfy = re.search("https?://(.+\.)?gfycat.com/(.*)\.?", url)
    if gfy:
        return "https://zippy.gfycat.com/" + gfy.group(2) + ".mp4"

    return url
