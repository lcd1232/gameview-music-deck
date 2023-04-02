import os
import typing
import json
import aiohttp
import helpers
import getpass
import time
from urllib.parse import urlparse, parse_qs
import base64
import asyncio
import urllib.request

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky_plugin

config_url: str = 'https://raw.githubusercontent.com/lcd1232/gameview-music-data/main/v1/data.json'

class Plugin:
    async def _load_config(self) -> dict:
        # file_path: str = os.path.join(decky_plugin.DECKY_PLUGIN_DIR, "config.json")
        file_path: str = os.path.join("/tmp", "config.json")
        headers: dict = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
        # Check if the file exists and was modified within the last 24 hours
        if os.path.exists(file_path) and time.time() - os.path.getmtime(file_path) < 24*60*60:
            decky_plugin.logger.info("Loading config from file")
            with open(file_path, 'r') as file:
                data = file.read()
        else:
            decky_plugin.logger.info(f"Fetching new config {file_path}")
            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(config_url, ssl=helpers.get_ssl_context()) as response:
                    data = await response.text()
                    with open(file_path, 'w') as file:
                        file.write(data)
        return json.loads(data)

    async def _video_id_from_url(self, url: str) -> str:
        query_params = urlparse(url).query
        return parse_qs(query_params)['v'][0]

    async def _video_id_exists(self, video_id: str) -> typing.Optional[str]:
        for format in ["mp4"]:
            file_path: str = os.path.join(decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, f"{video_id}.{format}")
            # decky_plugin.logger.debug(f"Looking for {file_path}")
            if os.path.exists(file_path):
                return file_path
        return None
    
    async def _get_audio_url(self, url: str) -> typing.Tuple[str, str]:
        url: str = f"https://api.microlink.io/?url={url}&audio"
        headers: dict = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
        async with aiohttp.ClientSession(headers=headers) as session:
            async with session.get(url, ssl=helpers.get_ssl_context()) as response:
                data = await response.json()
                decky_plugin.logger.info(f"URL - {url}, data - {data}")
                if data["status"] != "success":
                    raise Exception(f"unsuccess status: {data['status']}")
                download_url: str = data["data"]["audio"]["url"]
                audio_type: str = data["data"]["audio"]["type"]
                return download_url, audio_type

    def _download_video(self, url: str, video_id: str, audio_type: str) -> str:
        decky_plugin.logger.info("download video started")
        headers: dict = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
        file_path: str = os.path.join(decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, f"{video_id}.{audio_type}")
        request = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(request, context=helpers.get_ssl_context()) as response:
            if response.status == 200:
                with open(file_path, 'wb') as file:
                    while True:
                        chunk = response.read(500 * 1024)  # Read 500kb at a time
                        if not chunk:
                            break
                        file.write(chunk)
            else:
                decky_plugin.logger.error(f"Failed to download audio for {video_id}: status {response.status}")
        return file_path

    async def get_sound_path(self, game_id: int, game_name: str) -> typing.Tuple[typing.Optional[str], bool]:
        """Returns path to file where sound is located"""
        config: dict = await self._load_config(self)
        decky_plugin.logger.info(config)
        if config["app_id"].get(str(game_id)):
            game_data: dict = config["app_id"][str(game_id)]
            video_id: str = await self._video_id_from_url(self, game_data["url"])
            video_path: str = await self._video_id_exists(self, video_id)
            if video_path:
                return video_path, True
            download_url, audio_type = await self._get_audio_url(self, game_data["url"])
            # We will run download video in parallel and in the same time give a link to frontend to play a song ASAP.
            asyncio.create_task(asyncio.to_thread(self._download_video, self, download_url, video_id, audio_type))
            return download_url, False
        return None
    
    async def get_sound_url(self, game_id: int, game_name: str) -> typing.Optional[str]:
        file_path, is_file = await self.get_sound_path(self, game_id, game_name)
        if not file_path:
            return None
        if is_file:
            with open(file_path, "rb") as file:
                encoded_string = base64.b64encode(file.read())
                return f"data:audio/mpeg;base64,{encoded_string.decode()}"
        return file_path # file_path is url

    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def add(self, left, right):
        return left + right

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        decky_plugin.logger.info(f"Current user {getpass.getuser()}")
        await self._load_config(self)

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        decky_plugin.logger.info("Goodbye World!")
        pass
