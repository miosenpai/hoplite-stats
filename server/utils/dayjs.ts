import dayjs from 'dayjs'
import objectSupport from 'dayjs/plugin/objectSupport'
import duration from 'dayjs/plugin/duration'

dayjs.extend(objectSupport)
dayjs.extend(duration)

export default dayjs
