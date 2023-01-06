import { useEffect, useState } from "react"
import { Col, Input, Row } from "reactstrap"
import { getItem } from "../misc/helper"
import BASE_URL from "../misc/url"

const Upload = () => {
  const [filter, setFilter] = useState([])
  const [video, setVideos] = useState([])
  const [search, setSearch] = useState([])
  const [details, setDetails] = useState({})
  const getAllUsers = async () => {
    const response = await fetch(`${BASE_URL}users`, {
      headers: new Headers({
        "Authorization": `Bearer ${getItem("bly_token")}`
      })
    })
    if (response.status < 400) {
      const result = await response.json()
      setFilter(result.data)
      console.log(result)
      return
    }
    console.log("error")
  }

  const findMatches = (e) => {
    setVideos([])
    if (e.target.value.length >= 3) {
      const sort = filter.filter((dt) => {
        const regex = new RegExp(e.target.value, "gi")
        return dt?.fullName.match(regex) || dt?.email.match(regex)
      })
      setSearch(sort)
    } else setSearch([])
  }

  const showVideos = (e) => {
    setDetails({
      name: e.fullName,
      email: e.email
    })
    setVideos(e.reports)
  }

  useEffect(() => {
    getAllUsers()
  }, [])
  return (
    <Row>
      <Col lg="4" md="6" className="mx-auto">
        <Input
          type="search"
          className="shadow-none mb-3"
          onChange={findMatches}
          placeholder="Search Name for uploaded videos"
        />
        {search.length && !video.length
          ? search.map((e) => (
              <div
                className="p-3 my-3 d-flex justify-content-between align-items-center shadow rounded "
                role="button"
                onClick={() => showVideos(e)}
              >
                {e.fullName}
                <small>{e.email}</small>
              </div>
            ))
          : ""}

        {video.length ? (
          <>
            <div
              className="p-3 my-3 d-flex justify-content-between align-items-center shadow rounded "
              role="button"
            >
              {details.name}
              <small>{details.email}</small>
            </div>
            {video.map((e) => (
              <div className="mb-3">
                <video width="100%" controls>
                  <source src={`${BASE_URL}${e.video_link}`} />
                  Your browser does not support HTML5 video.
                </video>
                Date uploaded : {new Date(e.createdAt).toDateString()}
              </div>
            ))}
          </>
        ) : (
          ""
        )}
      </Col>
    </Row>
  )
}

export default Upload