import {
	afterPatch,
	ServerAPI,
	wrapReactType
} from "decky-frontend-lib";
import { ReactElement } from "react";
import { AudioView } from "./components/Audio/Audio";

export const patchAppPage = (serverApi: ServerAPI) => {
	return serverApi.routerHook.addPatch(
		'/library/app/:appid',
		(props: { path: string; children: ReactElement }) => {
			afterPatch(
				props.children.props,
				'renderFunc',
				(_: Record<string, unknown>[], ret1: ReactElement) => {
					const appId: number =
						ret1.props.children.props.overview.appid;
					wrapReactType(ret1.props.children);
					afterPatch(
						ret1.props.children.type,
						'type',
						(_1: Record<string, unknown>[], ret2: ReactElement) => {
							const componentToSplice =
								ret2.props.children?.[1]?.props.children.props
									.children;
							// This always seems to be -1
							const hltbComponentIndex =
								componentToSplice.findIndex(
									(child: ReactElement) => {
										return (
											child?.props?.id === 'hltb-for-deck'
										);
									}
								);

							// We want to splice into the component before this point
							const spliceIndex = componentToSplice.findIndex(
								(child: ReactElement) => {
									return (
										child?.props?.childFocusDisabled !==
										undefined &&
										child?.props?.navRef !== undefined &&
										child?.props?.children?.props
											?.details !== undefined &&
										child?.props?.children?.props
											?.overview !== undefined &&
										child?.props?.children?.props
											?.bFastRender !== undefined
									);
								}
							);

							const component = (
								<AudioView
									appId={appId}
									serverApi={serverApi}
								/>
							);

							if (hltbComponentIndex < 0) {
								if (spliceIndex > -1) {
									componentToSplice.splice(
										spliceIndex,
										0,
										component
									);
								} else {
									console.error(
										'hltb-for-deck could not find where to splice!'
									);
								}
							} else {
								componentToSplice.splice(
									hltbComponentIndex,
									1,
									component
								);
							}
							return ret2;
						}
					);
					return ret1;
				}
			);
			return props;
		}
	);
};
