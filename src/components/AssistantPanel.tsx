import { useI18n } from "../i18n";
import oggPortrait from "../assets/ogg-portrait.jpg";

type Props = {
	name: string | null;
	onConfigureCrew: () => void;
	onRename: () => void;
};

export default function AssistantPanel({
	name,
	onConfigureCrew,
	onRename,
}: Props) {
	const { t } = useI18n();

	return (
		<article className="panel assistant-panel">
			<span>{t("onboardComputer")}</span>

			<div className="assistant-panel__layout">
				<div className="assistant-panel__portrait-wrap" aria-hidden="true">
					<img
						className="assistant-panel__portrait"
						src={oggPortrait}
						alt=""
					/>
				</div>

				<div className="assistant-panel__content">
					<h2>{name ?? t("unnamed")}</h2>
					<p>{t("assistantDescription")}</p>

					<div className="assistant-actions">
						<button type="button" onClick={onConfigureCrew} disabled={!name}>
							<span className="assistant-actions__icon" aria-hidden="true">
								👥
							</span>
							{t("configureCrew")}
						</button>

						<button type="button" onClick={onRename} disabled={!name}>
							<span className="assistant-actions__icon" aria-hidden="true">
								✎
							</span>
							{t("renameComputer")}
						</button>
					</div>
				</div>
			</div>
		</article>
	);
}
