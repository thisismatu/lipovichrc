import React, { useEffect, useState } from 'react'
import classnames from 'classnames-minimal'
import { ReactComponent as HelpIcon } from '../images/help.svg'
import { ReactComponent as AddIcon } from '../images/add.svg'
import { ReactComponent as RemoveIcon } from '../images/remove.svg'
import './CourseRule.css'

export default function CourseRule({ rule, value = 0, stepperFn }) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (value === 0) return
    window.navigator.vibrate(20)
    setAnimate(a => !a)
    setTimeout(() => {
      setAnimate(a => !a)
    }, 500)
  }, [value]);

  const courseRuleClassName = classnames({
    CourseRule: true,
    'CourseRule--animated': animate
  })

  return (
    <div className={courseRuleClassName}>
      <div>
        <div className="CourseRule__Name">{rule.name}</div>
        <div className="CourseRule__Points">
          {rule.label}
          {rule.description && (
            <button className="CourseRule__HelpButton" onClick={() => alert(rule.description)}><HelpIcon width={17} height={17} /></button>
          )}
        </div>
      </div>
      <div className="Stepper">
        <button className="Stepper__Button" onClick={() => stepperFn(rule.id, value - 1)}><RemoveIcon width={18} height={18} /></button>
        <div className="Stepper__Input" type="number">{value}</div>
        <button className="Stepper__Button" onClick={() => stepperFn(rule.id, value + 1)}><AddIcon width={18} height={18} /></button>
      </div>
    </div>
  )
}
