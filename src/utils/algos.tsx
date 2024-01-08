import { View, Text } from "react-native"
import moment from 'moment/moment';

const dateToTime = (date) => {
    let hours = date.hours()
    let minutes = date.minutes()
    let ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12
    hours = hours ? hours : 12
    minutes = minutes < 10 ? '0' + minutes : minutes
    let strTime = hours + ':' + minutes + ' ' + ampm
    return strTime
}

export const handleDate = (dat) => {
    const temp = moment(dat)
    const today = moment()
    let date
    if (temp.year() === today.year()) {
        // same year
        if (temp.month() === today.month()) {
            // same month
            if (temp.date() === today.date()) {
                // same day

                date = "Today"
            } else {
                if (today.date() - temp.date() === 1) {
                    date = "Yesterday"
                } else {
                    date = temp.format("dddd")
                }
            }

            date = date + " at " + dateToTime(temp)
        } else {
            date = temp.format("MMM Do")
        }
    } else {
        date = temp.format("D MMM YY")
    }

    return (
        <View style={{ marginLeft: 'auto', marginRight: 10 }}>
            <Text style={{ color: 'darkgrey' }}>{date}</Text>
        </View>
    )

}