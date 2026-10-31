import { INTERVIEW_TIMING } from '@/constants/application'
import { interviewTiming, localTimeEpoch, safeMeetingUrl } from '@/utils/application'

const MAX_ICS_LINE_BYTES = 75
const URL_REVOKE_DELAY_MS = 1000
const escapeText = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
const utcTime = (epoch) =>
  new Date(epoch)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
const foldLine = (line) => {
  const encoder = new TextEncoder(),
    parts = []
  let current = '',
    length = 0
  for (const character of line) {
    const bytes = encoder.encode(character).length
    if (length + bytes > MAX_ICS_LINE_BYTES) {
      parts.push(current)
      current = ' '
      length = 1
    }
    current += character
    length += bytes
  }
  parts.push(current)
  return parts.join('\r\n')
}
export const createInterviewCalendar = (interview, context, now) => {
  if (
    ![INTERVIEW_TIMING.UPCOMING, INTERVIEW_TIMING.ONGOING].includes(interviewTiming(interview, now))
  )
    throw new Error('该面试已取消、过期或时间不可用，请刷新后再导出')
  const title = `${context.companyName || '企业'} ${context.jobTitle || '岗位'}面试`
  const url = safeMeetingUrl(interview.meetingUrl)
  const description = [interview.candidateNote, url].filter(Boolean).join('\n')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Smart Recruit//Interview//ZH',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:interview-${interview.id}@smart-recruit.local`,
    `SEQUENCE:${interview.version}`,
    `DTSTAMP:${utcTime(now)}`,
    `DTSTART:${utcTime(localTimeEpoch(interview.startTime))}`,
    `DTEND:${utcTime(localTimeEpoch(interview.endTime))}`,
    `SUMMARY:${escapeText(title)}`,
    `LOCATION:${escapeText(interview.address || interview.platform || '')}`,
    `DESCRIPTION:${escapeText(description)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(foldLine).join('\r\n') + '\r\n'
}
export const downloadInterviewCalendar = (interview, context, now) => {
  const content = createInterviewCalendar(interview, context, now)
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `面试安排-${interview.id}.ics`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), URL_REVOKE_DELAY_MS)
}
