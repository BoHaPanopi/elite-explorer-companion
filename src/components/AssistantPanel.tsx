import { useI18n } from "../i18n";
import oggOfficialPortrait from "../assets/ogg-official-portrait.png";

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
	const normalizedName = name?.trim();
	const displayName =
		normalizedName?.toLowerCase() === "old guy of grumpy"
			? "Old Guy of Grumpy"
			: normalizedName || "Old Guy of Grumpy";

	return (
		<article className="panel assistant-panel">
			<span>{t("onboardComputer")}</span>

			<div className="assistant-panel__layout">
				<div className="assistant-panel__portrait-wrap">
					<img
						className="assistant-panel__portrait-image"
						src={oggOfficialPortrait}
						alt="Old Guy of Grumpy"
						loading="eager"
					/>
				</div>

				<div className="assistant-panel__content">
					<h2>{displayName}</h2>
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
