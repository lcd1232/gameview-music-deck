import {
	afterPatch, 
	RoutePatch,
	ServerAPI
	} from "decky-frontend-lib";
import {ReactElement} from "react";
import {AppOverview} from "./SteamClient";

export const patchAppPage = (serverAPI: ServerAPI): RoutePatch =>
{
	// @ts-ignore
	return serverAPI.routerHook.addPatch("/library/app/:appid", (props: { path: string, children: ReactElement }) =>
	{
		afterPatch(
				props.children.props,
				"renderFunc",
				(_: Record<string, unknown>[], ret1: ReactElement) =>
				{
          const videoUrl = "https://www.youtube.com/watch?v=WoaciaBBCvc"
          fetch(`https://api.microlink.io/?url=${videoUrl}&audio`)
            .then((response) => response.json())
            .then((data) => {
              console.log(data.data.audio.url);
              let audio = new Audio(data.data.audio.url);
              audio.play();
            });
					const overview: AppOverview = ret1.props.children.props.overview;
					const appid = overview.appid;
          console.log(overview);
          console.log(appid);
					return ret1;
				}
		);
		return props;
	});
}
