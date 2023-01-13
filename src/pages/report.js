/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { getItem } from "../misc/helper"
import BASE_URL from "../misc/url"
import { Button, Col, Input, Row } from "reactstrap"
import { Icontroller } from "./signup"
import useSchool from "../hooks/school.hook"
import { toast } from "react-toastify"
import AppContext from "../misc/appContext"
import { useNavigate } from "react-router-dom"
import Select from "react-select"
import { bullyTemplate, templateSchoolThreat, templateWeaponThreat } from "../misc/template"

const Report = () => {
  const { handleSubmit, control, reset } = useForm()
  const [upload, setUpload] = useState("")
  const [loading, setLoading] = useState(false)
  const [blob, setBlob] = useState("")
  const { school, getSchools } = useSchool()
  const [schoolOPt, setOptions] = useState([])
  const [chosenSchool, setChosenSchool] = useState({})
  const { token, reporter } = useContext(AppContext)
  const [trustee, setTrustee] = useState()
  const [otherData, setOtherData] = useState({})
  const [reportType, setReportType] = useState("")
  const [sentReport, setSentReport] = useState("")
  const navigate = useNavigate()
  // const reporter =  user()

  const preview = (e) => {
    const url = e.target.files[0]
    const blobUrl = URL.createObjectURL(url)
    setBlob(blobUrl)
    setUpload(url)
  }

  const options = () => {
    console.log(school)
    const opt = []
    school.forEach((e) => {
      opt.push({
        value: e.zip_code,
        label: e.school_name + " (" + e.zip_code + ")",
        zap: e.school_name
      })
    })
    setOptions(opt)
    console.log(opt)
  }

  const chooseSchool = (e) => {
    console.log(e)
    setChosenSchool(e)
  }

  const getSigned = () => {
    if (!token) {
      navigate("/signin")
      toast("login to send report")
    }
  }

  const report = async (data) => {
    const { email, others } = otherData
    const templateRush = { ...data, ...others, ...chosenSchool, reporterEmail: email }
    const bullyT = bullyTemplate(templateRush)
    const templateWeapon = templateWeaponThreat(templateRush)
    const threat = templateSchoolThreat(templateRush)

    if (reportType === "bullying") setSentReport(bullyT)
    if (reportType === "weapon in school") setSentReport(templateWeapon)
    if (reportType === "threats against school") setSentReport(threat)

    setLoading(true)
    data.school_name = chosenSchool.zap
    data.zip_code = chosenSchool.value

    const formData = new FormData()
    formData.append("upload", upload)
    const j = Object.keys(data)
    const k = Object.keys(otherData)

    j.forEach((e) => formData.append(e, data[e]))
    k.forEach((e) => formData.append(e, data[e]))

    const response = await fetch(`${BASE_URL}report`, {
      method: "POST",
      body: formData,
      headers: new Headers({
        "Authorization": `Bearer ${getItem("bly_token")}`
      })
    })

    await response.json()

    if (response.status === 200) {
      setLoading(false)
      setUpload("")
      reset()

      toast("report sent successfully")
      await sendEmail({
        to: data.email,
        subject: otherData.report_type,
        html: sentReport
      })

      return
    }
    toast("unable to send report try again latter")
    setLoading(false)
  }

  const handleEv = (e) => {
    if (e.target.name === "report_type") setReportType(e.target.value)
    setOtherData({ ...otherData, [e.target.name]: e.target.value })
  }

  const sendEmail = async (data) => {
    const response = await fetch(`${BASE_URL}send/mail`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: new Headers({
        "Authorization": `Bearer ${getItem("bly_token")}`
      })
    })
    const j = await response.json()
    if (j?.message) toast("email sent")
  }

  useEffect(() => {
    getSigned()
    if (!schoolOPt.length) options()
  }, [school])

  return (
    <Row>
      <Col md="6" className="mx-auto mb-5">
        <form onSubmit={handleSubmit(report)} encType="multipart/form-data">
          <p>Upload a video evidence to proceed</p>
          <Input
            bsSize="sm"
            className="mb-3 shadow-none"
            type="file"
            name="video"
            placeholder="Video Evidence? "
            onChange={preview}
            accept="video/*"
            role="button"
          />

          {upload ? (
            <>
              <video width="100%" controls className="mb-3">
                <source src={blob} />
                Your browser does not support HTML5 video.
              </video>
              <div className="my-2">
                <label>Report Type</label>
                <Input type="select" name="report_type" className="shadow-none" onChange={handleEv}>
                  <option value=""></option>
                  <option value="bullying">Bullying</option>
                  <option value="threats against school">Threats against school</option>
                  <option value="weapon in school">Weapon in school</option>
                </Input>
              </div>

              {!reportType ? (
                ""
              ) : (
                <>
                  {reportType === "bullying" && (
                    <p>
                      I have information involving bullying in your school. I am reporting this
                      information through The BullyBloxx system. If you are not familiar with The
                      BullyBloxx system please go to www.bullybloxx.com for details. Once you are on
                      the site if you will click on the School Administrator tab at the top of the
                      Home page complete instructions for BullyBloxx will be provided for you. On
                      the home page is a search bar where you can enter my username (provided below)
                      and review my identification video. Thank you I am a trustee reporting this
                      information for a student who requests to not be identified; however, I will
                      act as an intermediary so you can immediately access any additional
                      information that you may need.
                    </p>
                  )}

                  {reportType === "weapon in school" && (
                    <p>
                      To report a WEAPON IN THE SCHOOL complete the form below and click SUBMIT
                      REPORT. The report will automatically be sent by email to the principal: Dear
                      Principal, I have information involving a weapon in your school. I am
                      reporting this threat through The BullyBloxx system.
                    </p>
                  )}

                  {reportType === "threats against school" && (
                    <p>
                      To report a school shooter or any type threat against a school complete the
                      form below and click SUBMIT REPORT. The report will automatically be sent by
                      email to the principal: Dear Principal, I have information involving a threat
                      against your school. I am reporting this threat through The BullyBloxx system.
                    </p>
                  )}

                  <label className="py-1">
                    <Input
                      type="radio"
                      name="trustee"
                      className="me-2"
                      value="I am
                    a trustee reporting this information for another individual who requests to not
                    be identified; however, I will act as an intermediary so you can immediately
                    access any additional information you need."
                      onChange={handleEv}
                    />{" "}
                    I am a trustee reporting this information for another individual who requests to
                    not be identified; however, I will act as an intermediary so you can immediately
                    access any additional information you need.
                  </label>
                  <label className="py-1">
                    <Input
                      type="radio"
                      name="trustee"
                      className="me-2"
                      value="not a trustee for someone else, I am submitting this information on my own
                    behalf."
                      onChange={handleEv}
                    />{" "}
                    I am not a trustee for someone else, I am submitting this information on my own
                    behalf.
                  </label>

                  <Icontroller name="email" placeholder="Principal Email" control={control} />

                  <div className="mb-2">
                    <label className="py-1">Name of School</label>
                    <Select options={schoolOPt} onChange={chooseSchool} />
                  </div>

                  <Icontroller
                    name="bully_fname"
                    placeholder="Bully First Name"
                    control={control}
                  />
                  <Icontroller name="bully_lname" placeholder="Bully Last Name" control={control} />
                  <Icontroller
                    name="bully_gender"
                    placeholder="Gender of bully"
                    control={control}
                    type="select"
                    opt={
                      <>
                        <option></option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </>
                    }
                  />
                  <Icontroller name="bully_grade" placeholder="Grade of Bully" control={control} />

                  <Icontroller
                    name="bully_teacher"
                    placeholder="Homeroom Teacher of bully"
                    control={control}
                  />

                  <Icontroller
                    name="incident_date"
                    type="date"
                    placeholder="Date of Incident"
                    control={control}
                  />

                  <Icontroller
                    name="incident_place"
                    placeholder="Where did this incident occur? Be specific."
                    control={control}
                  />

                  <Icontroller
                    name="incident_time"
                    type="time"
                    placeholder="Time of Incident"
                    control={control}
                  />

                  {/* threat section */}
                  {reportType === "threats against school" && (
                    <>
                      <Icontroller
                        name="threat_student_aware"
                        placeholder="Do any other people/students have knowledge of this threat? "
                        control={control}
                        type="select"
                        opt={
                          <>
                            <option></option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </>
                        }
                      />
                      <Icontroller
                        name="threat_other_student"
                        placeholder="If yes, what are their names? (if more than one person, separate their names using commas)"
                        type="textarea"
                        control={control}
                      />
                      <Icontroller
                        name="threat_details"
                        placeholder="In complete detail provide all information you have on this threat."
                        type="textarea"
                        control={control}
                      />
                    </>
                  )}

                  {/* weapon section */}
                  {reportType === "weapon in school" && (
                    <>
                      <Icontroller
                        name="w_type"
                        placeholder="What type of weapon is this?"
                        control={control}
                      />
                      <Icontroller
                        name="w_student_aware"
                        placeholder="Do any other people/students have knowledge of this threat? "
                        control={control}
                        type="select"
                        opt={
                          <>
                            <option></option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </>
                        }
                      />
                      <Icontroller
                        name="w_other_students"
                        placeholder="If yes, what are their names? (if more than one person, separate their names using commas)"
                        type="textarea"
                        control={control}
                      />
                      <Icontroller
                        name="w_sknow"
                        placeholder="Do you know why this student is bringing this weapon to school?"
                        type="textarea"
                        control={control}
                      />
                      <Icontroller
                        name="w_details"
                        placeholder="In complete detail provide all information you have on this threat."
                        type="textarea"
                        control={control}
                      />
                    </>
                  )}

                  {/* bully section */}
                  {reportType === "bullying" && (
                    <>
                      <Icontroller
                        name="staff_witnessed"
                        placeholder="Did any teacher or staff member see this incident?"
                        control={control}
                        type="select"
                        opt={
                          <>
                            <option></option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </>
                        }
                      />
                      <Icontroller
                        name="staff_witness"
                        placeholder="If yes, who was the teacher / staff member?"
                        control={control}
                      />
                      <Icontroller
                        name="staff_action"
                        placeholder="What actions did the teacher / staff member take?"
                        control={control}
                      />
                      <Icontroller
                        name="physical_abuse"
                        placeholder="Did the bully physically abuse the victim?"
                        control={control}
                        type="select"
                        opt={
                          <>
                            <option></option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </>
                        }
                      />

                      <Icontroller
                        name="victim_handicapped"
                        placeholder="Was the victim a handicapped student?"
                        control={control}
                        type="select"
                        opt={
                          <>
                            <option></option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </>
                        }
                      />
                      <Icontroller
                        name="victim_younger"
                        placeholder="Was the victim a younger or smaller student than the bully?"
                        control={control}
                        type="select"
                        opt={
                          <>
                            <option></option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </>
                        }
                      />

                      <Icontroller
                        name="bully_witnessed"
                        placeholder="Have you witnessed this bully abusing this same victim/student in the past?"
                        control={control}
                        type="select"
                        opt={
                          <>
                            <option></option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </>
                        }
                      />
                      <Icontroller
                        name="serail_bully"
                        placeholder="Have you witnessed this bully abusing other students in the past?"
                        control={control}
                        type="select"
                        opt={
                          <>
                            <option></option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </>
                        }
                      />
                      <Icontroller
                        name="details"
                        placeholder="If Yes, please provide any details of other bullying incidents that you have witnessed or seen in the past involving this bully."
                        type="textarea"
                        control={control}
                      />
                      <Icontroller
                        name="other_incident"
                        placeholder="If more than one bully add their names here Names of any other students that supported the bully’s actions"
                        type="textarea"
                        control={control}
                      />
                    </>
                  )}

                  <div className="mb-2">
                    <label className="py-1">
                      <Input type="checkbox" className="me-2" />
                      Please send me a reply email confirming that you have received this
                      information, this will allow me to know that the information that I have
                      submitted is being properly addressed. Thank you.
                    </label>
                  </div>

                  <Button
                    bsSize="sm"
                    disabled={loading}
                    color="dark"
                    className="mb-3 shadow-none form-control"
                    type="submit"
                  >
                    Send Report
                  </Button>
                </>
              )}
            </>
          ) : (
            ""
          )}
        </form>
      </Col>
    </Row>
  )
}

export default Report
