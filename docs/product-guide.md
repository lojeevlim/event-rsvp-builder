# Event RSVP: how the app works

What each kind of user can do, and where to find it.

## Roles

| Role | Who | What they can do |
|---|---|---|
| **Super admin** | Emails listed in `SUPER_ADMIN_EMAILS` | See every registered user and every event, enable or disable accounts, change roles, hide or delete any event, see platform-wide totals. Also works as a host. |
| **Host** | Anyone who signs up | Create events, design them, share the public link, see replies, customise and send emails. Only sees their own events. |
| **Guest** | Anyone with an event link | Opens the event page and replies. No account needed. |

A new sign-up is a host. An email in `SUPER_ADMIN_EMAILS` becomes a super admin the first time it signs in. A super admin can also promote or demote others from the Super admin page.

## Pages

| Address | For | What it is |
|---|---|---|
| `/` | everyone | Landing page with sign in and sign up |
| `/sign-in`, `/sign-up` | everyone | Login and registration (Clerk) |
| `/dashboard` | hosts | My events: counts of who can attend and who can't, for each event |
| `/dashboard/events/<id>` | hosts | The event's public link, the reply list with totals, publish or hide, delete |
| `/dashboard/events/<id>/emails` | hosts | The Emails menu (see below) |
| `/editor/<id>` | hosts | The visual design editor for the event page |
| `/dashboard/profile` | hosts | Name, email, password and sign-in methods, plus account facts |
| `/super` | super admins | Users, events and totals |
| `/e/<slug>` | guests | The public event page with the RSVP form |

## A host's workflow

1. **Sign up** and open **My events**.
2. **New event**: give it a name and a type. The type fills in ready-made text. The design editor opens.
3. **Design** the page: sections, stickers, map, countdown, colours, font style, and every part of the RSVP form (move, hide, resize, rewrite). Press **Save**.
4. **Share** the link from the event page, or email it from the Emails tab.
5. **Watch replies** arrive: totals for can attend, can't attend and people coming, plus each guest's name, party size and note.

An event can be **hidden** at any time; its link then shows "not available" until it is published again.

## Emails

Each event has two customisable emails. Edit them under **Emails** on the event page, with a live preview.

| Email | Sent | 
|---|---|
| **Invitation** | When the host pastes email addresses and presses send (up to 25 at a time, and a daily limit, 200 by default) |
| **RSVP confirmation** | Automatically to a guest who replies that they can attend |

What can be changed: subject, heading, message, button label, band and button colour, background colour and footer. The words `{guest}`, `{event}`, `{link}` and `{guests}` are replaced for each guest. **Send a test to me** delivers the email to the host's own inbox. Guest replies to either email go to the host's address. Every send is logged, with its result, on the Emails tab.

## Accounts and safety

- Every request is checked against the database, not only against Clerk: the user is created on first sign-in, and a **disabled** account is rejected straight away.
- Disabling a user hides all their event pages at once. Enabling brings them back.
- Hosts only ever see their own events. A super admin can open any event to look at its replies, but only the owner can change its design, emails or guests.
- A super admin cannot disable or change their own account, so there is always someone able to sign in.
- Guests' replies are visible only to the event's host and to super admins.
- Event pages are not indexed by search engines.
- The RSVP form has a hidden trap field to catch bots, and the same email cannot reply twice to one event.

## Limits

| Limit | Default | Environment variable |
|---|---|---|
| Events per host | 20 | `MAX_EVENTS_PER_HOST` |
| Invitations emailed per event per 24 hours | 200 | `MAX_INVITES_PER_DAY` |
| Emails per send | 25 | fixed |
| Image upload size | 5 MB | fixed |

## Not included yet

- A guest list with personal links per guest (the event uses one public link, so a host can't see who was invited but hasn't replied).
- Email on a schedule, or reminders.
- Importing events or replies from the earlier single-event version.
