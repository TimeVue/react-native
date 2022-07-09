interface Shift {
    id: number
    startTime: string
    endTime: string
    totalSeconds: number
}

interface Employee {
    shifts: Shift[]
    id: number
    name: string
    currentShift?: Shift
}