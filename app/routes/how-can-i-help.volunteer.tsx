import {MetaFunction} from '@remix-run/node'
import DropDown from '~/components/DropDown'
import HelpItem from '~/components/HowCanIHelp/HelpItem'
import CategoryCarousel from '~/components/HowCanIHelp/CategoryCarousel'
import Testimonial from '~/components/Testimonial'
import Base from '~/components/HowCanIHelp/Base'
import BaginskiImg from '~/assets/Baginski.jpeg'

export const meta: MetaFunction = () => {
  return [{title: 'How Can I Help? - AISafety.info'}]
}

const TopText = () => (
  <>
    <div className="padding-bottom-64">
      <div className="flexbox-alt">
        <div className="col-6-alt">
          <p className="default-bold padding-bottom-16">Who</p>
          <p className="grey default">
            Almost any skill set can be adapted to a volunteer role. Some commonly sought-after
            skills include technical expertise (such as math and code), communications, project
            management, and general organizing.
          </p>
        </div>
        <div className="col-6-alt">
          <p className="default-bold padding-bottom-16">Why this is important</p>
          <p className="grey default">
            Volunteering, especially in areas of field-building and movement-building, supports
            efforts that are important but bottlenecked by AI safety’s funding shortage—such as
            AISafety.com and AI Safety Quest
          </p>
        </div>
      </div>
    </div>
  </>
)

const Dropdowns = () => (
  <div className="padding-bottom-80 grey default">
    <DropDown title="What does volunteering involve?">
      <div className="col-7-alt">
        <p>
          About 90% of volunteer work is online, and involves field-building through communication,
          advocacy, or software development; providing feedback on research; or establishing or
          organizing online groups. In-person volunteer work may entail organizing meetups,
          protests, or retreats.
        </p>
      </div>
    </DropDown>
    <DropDown title="What level of commitment is required?">
      <div className="col-7-alt">
        <p>
          Typically volunteers commit up to several hours a week for at least a few months. However,
          volunteers that accomplish one 15-minute task a week, consistently, can also be very
          helpful. What’s most important is that you understand how much you are able to commit
          upfront, and follow through with that commitment.
        </p>
      </div>
    </DropDown>
  </div>
)

const Options = () => (
  <>
    <div className="padding-bottom-80">
      <h2 className="teal-500 padding-bottom-64">Options for getting started</h2>
      <div>
        <HelpItem
          title="Sign up for free 1-on-1 volunteering advice with AI Safety Quest & 80,000 Hours"
          className="padding-bottom-64"
          links={[
            {
              title: 'Book your AI Safety Quest call',
              action: 'https://aisafety.quest/#calls',
            },
            {
              title: 'Book your 80,000 Hours call',
              action: 'https://80000hours.org/speak-with-us',
            },
          ]}
        >
          <div>
            <p className="padding-bottom-24">
              Get personalized volunteering advice in a 30-minute or one hour video call. We
              recommend booking both!
            </p>
            <div>
              <span className="small-bold"> Note: </span>
              <span className="small">80,000 Hours does not accept all applicants</span>
            </div>
          </div>
        </HelpItem>

        <HelpItem
          title="Join the monthly AED calls"
          className="padding-bottom-64"
          links={[
            {
              title: 'Add the next AED call to your calendar',
              action:
                'https://calendar.google.com/calendar/u/0/share?slt=1AUWfa3j72XM5H9AQ6Wsx-PYfhAraCnI2kGks7D3h5TiLPtleaCfXXecE2a2NAhXU4S5dOqYYPpJHG2i4UtbUuzdMNJXFAA2FjsyL',
            },
          ]}
          additionalInfo={
            <>
              Or, learn more about AED on{' '}
              <a
                href="https://alignment.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="small-bold teal-500"
              >
                their website
              </a>
            </>
          }
        >
          <p>
            {' '}
            Alignment Ecosystem Development (AED) is a nonprofit organization and community of
            volunteers supporting online AI safety field-building projects like AISafety.com and AI
            Safety Quest. You can join an existing project or pitch your own to recruit help.
          </p>
        </HelpItem>

        <HelpItem
          title="Join one of our projects seeking volunteer help"
          links={[
            {
              title: 'Browse our list of projects',
              action: 'https://www.aisafety.com/projects',
            },
          ]}
        >
          <p>
            Browse our list of online AI safety field-building projects and email the contact person
            expressing your interest
          </p>
        </HelpItem>
      </div>
    </div>

    <div className="flexbox">
      {/* TESTIMONIALS TEMPORARILY REMOVED
      <Testimonial
      src={LonsImg}
      title="Chris Lons"
      description="Lorem ipsum"
      className="col-6"
      />
    */}
      <Testimonial
        src={BaginskiImg}
        title="Mateusz Bagiński"
        description="I have some software engineering skills, and wanted to contribute towards reducing AI existential risk, so I joined the AISafety.info team in September 2022. Over the next year, I put in several volunteering hours a week, when I had time. I worked on various software tasks that improved AISafety.info, like optimizing the AI Safety Chatbot and migrating our entire article database into Google Docs."
        layout="expanded"
      />
    </div>

    <div>
      <CategoryCarousel title={<span>Our articles on volunteering</span>} category="NM18" />
    </div>
  </>
)

export default function Volunteer() {
  return (
    <Base title={<span>Volunteer</span>} current="volunteer">
      <TopText />

      <Dropdowns />

      <Options />
    </Base>
  )
}
