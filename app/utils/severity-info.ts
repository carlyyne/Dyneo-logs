export const SEVERITY_INFO: Array<{
  level: Log['level']
  description: string
  recommendation: string
}> = [
  { level: 'critical', description: 'Severe impact.', recommendation: 'Act now.' },
  { level: 'error', description: 'Serious impact.', recommendation: 'Act fast.' },
  { level: 'warning', description: 'An unusual condition that could become an error if it continues.', recommendation: 'Check soon.' },
  { level: 'debug', description: 'Detailed diagnostic information.', recommendation: 'Use during investigation.' },
  { level: 'info', description: 'Raised for information purposes.', recommendation: 'No action required.' },
]