import React, { useCallback, useEffect, useState } from 'react'
import { useIdb } from 'react-use-idb'
import { useHistory } from 'react-router-dom'
import { useSpeechContext } from '@speechly/react-client'
import formatDuration from 'format-duration'
import { courseRules } from '../utils/rules'
import { isEmpty } from '../utils/actions'
import { useTimer } from '../utils/useTimer'
import Navigation from '../components/Navigation'
import Button from '../components/Button'
import CourseRule from '../components/CourseRule'
import Spinner from '../components/Spinner'
import './Competition.css'

function Competition() {
  const history = useHistory()
  const [drivers, setDrivers] = useIdb('drivers')
  const [currentDriverId, setCurrentDriverId] = useIdb('current-driver-id', 0)
  const { isRunning, elapsedTime, startTimer, stopTimer, setElapsedTime} = useTimer()
  const { segment } = useSpeechContext()
  const [segmentPosition, setSegmentPosition] = useState(-1)

  const getCurrentDriver = useCallback(() => {
    const index = drivers.findIndex(driver => driver.id === currentDriverId)
    return {...drivers[index], index}
  }, [currentDriverId, drivers])

  const setDriverPoints = useCallback((ruleId, value) => {
    const newArray = drivers.map(driver =>
      driver.id === currentDriverId ? { ...driver, points: { ...driver.points, [ruleId]: value } } : driver
    )
    setDrivers(newArray)
  }, [currentDriverId, drivers, setDrivers])

  useEffect(() => {
    if (!isEmpty(segment?.entities)) {
      const entityArr = segment.entities
      const ruleId = Number(entityArr[entityArr.length - 1].value)
      const value = getCurrentDriver().points[ruleId] || 0
      if (segmentPosition < entityArr.length - 1) {
        setDriverPoints(ruleId, value + 1)
        setSegmentPosition(entityArr.length - 1)
      }
    }
    if (segment?.isFinal) {
      setSegmentPosition(-1)
    }
  }, [segment])

  const stopTimerSetDriverTime = () => {
    stopTimer()
    const newArray = drivers.map(driver =>
      driver.id === currentDriverId ? { ...driver, elapsedTime } : driver
    )
    setDrivers(newArray)
  }

  const setPrevDriver = () => {
    stopTimerSetDriverTime()
    const prevDriver = drivers.at(getCurrentDriver().index - 1)
    setCurrentDriverId(prevDriver.id)
    setElapsedTime(prevDriver.elapsedTime)
  }

  const setNextDriver = () => {
    stopTimerSetDriverTime()
    const nextDriver = drivers.at(getCurrentDriver().index + 1) || drivers.at(0)
    setCurrentDriverId(nextDriver.id)
    setElapsedTime(nextDriver.elapsedTime)
  }

  const onEndCompetition = () => {
    if (window.confirm("End competition?")) {
      history.push('/finish')
    }
  }

  const onTimerPress = () => isRunning ? stopTimerSetDriverTime() : startTimer()

  const onDriverPointsChange = (id, value, max) => {
    if (value < 0 || value > max) return
    setDriverPoints(id, value)
  }

  if (isEmpty(drivers)) return <Spinner />

  return (
    <>
    <Navigation
      title={getCurrentDriver().name || ''}
      subtitle={formatDuration(elapsedTime * 100)}
      leftClickFn={setPrevDriver}
      rightClickFn={setNextDriver}
    />
    <div className="Competition">
      {courseRules.map(rule =>
        <CourseRule
          key={rule.id}
          rule={rule}
          value={getCurrentDriver().points[rule.id] || 0}
          stepperFn={onDriverPointsChange} />
      )}
    </div>
    <div className="Competition__Footer">
      <Button onClick={onEndCompetition} color="secondary">End Competition</Button>
      <Button onClick={onTimerPress} color="primary">{isRunning ? 'Pause' : 'Start'} Timer</Button>
    </div>
    </>
  )
}

export default Competition