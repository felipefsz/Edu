import { useApp } from '../app/AppState';

export function SettingsPage() {
  const {
    resetDemoState,
    state,
    toggleLanguage,
    toggleTheme,
    updateNotificationChannel,
    updatePreferences,
  } = useApp();

  return (
    <div className="settings-grid">
      <section className="panel-card">
        <div className="panel-card__eyebrow">Appearance</div>
        <div className="stack-gap-sm">
          <button className="ghost-button ghost-button--full" type="button" onClick={toggleTheme}>
            Theme: {state.preferences.theme}
          </button>
          <button className="ghost-button ghost-button--full" type="button" onClick={toggleLanguage}>
            Language: {state.preferences.language}
          </button>
          <label className="checkbox-row" htmlFor="reduce-motion">
            <input
              id="reduce-motion"
              type="checkbox"
              checked={state.preferences.reduceMotion}
              onChange={(event) => updatePreferences({ reduceMotion: event.target.checked })}
            />
            <span>Reduce motion</span>
          </label>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__eyebrow">Density and transparency</div>
        <div className="stack-gap-sm">
          <select
            className="ui-input"
            value={state.preferences.feedDensity}
            onChange={(event) =>
              updatePreferences({ feedDensity: event.target.value as 'comfortable' | 'compact' })
            }
          >
            <option value="comfortable">Feed density: comfortable</option>
            <option value="compact">Feed density: compact</option>
          </select>
          <select
            className="ui-input"
            value={state.preferences.chatDensity}
            onChange={(event) =>
              updatePreferences({ chatDensity: event.target.value as 'comfortable' | 'compact' })
            }
          >
            <option value="comfortable">Chat density: comfortable</option>
            <option value="compact">Chat density: compact</option>
          </select>
          <select
            className="ui-input"
            value={state.preferences.transparency}
            onChange={(event) =>
              updatePreferences({
                transparency: event.target.value as 'comfortable' | 'soft' | 'solid',
              })
            }
          >
            <option value="comfortable">Transparency: comfortable</option>
            <option value="soft">Transparency: soft</option>
            <option value="solid">Transparency: solid</option>
          </select>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__eyebrow">Notification channels</div>
        <div className="stack-gap-sm">
          <label className="checkbox-row" htmlFor="channel-social">
            <input
              id="channel-social"
              type="checkbox"
              checked={state.preferences.notificationChannels.social}
              onChange={(event) => updateNotificationChannel('social', event.target.checked)}
            />
            <span>Social updates</span>
          </label>
          <label className="checkbox-row" htmlFor="channel-message">
            <input
              id="channel-message"
              type="checkbox"
              checked={state.preferences.notificationChannels.message}
              onChange={(event) => updateNotificationChannel('message', event.target.checked)}
            />
            <span>Messages</span>
          </label>
          <label className="checkbox-row" htmlFor="channel-academic">
            <input
              id="channel-academic"
              type="checkbox"
              checked={state.preferences.notificationChannels.academic}
              onChange={(event) => updateNotificationChannel('academic', event.target.checked)}
            />
            <span>Academic activity</span>
          </label>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__eyebrow">Experience tuning</div>
        <div className="stack-gap-sm">
          <div className="list-card">
            <strong>Feed behavior</strong>
            <small>Use compact mode for denser reading or keep comfortable for the editorial layout.</small>
          </div>
          <div className="list-card">
            <strong>Chat behavior</strong>
            <small>Compact mode keeps more messages on screen and pairs well with desktop review sessions.</small>
          </div>
          <div className="list-card">
            <strong>Future AI layer</strong>
            <small>This app is being prepared for AI helpers like study suggestions, writing feedback, and moderation prompts.</small>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__eyebrow">Demo control</div>
        <p className="muted-copy">
          The old inline HTML database is no longer the app source of truth. This React version
          persists in localStorage and is being prepared for a real backend later.
        </p>
        <button className="danger-button" type="button" onClick={resetDemoState}>
          Reset demo state
        </button>
      </section>
    </div>
  );
}
