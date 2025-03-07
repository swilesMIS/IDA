import '@styles/globals.css';
import Nav from '@components/Nav';
import SearchBar from '@components/SearchBar'
import AddTagButton from '@components/AddTagButton'
import Provider from '@components/Provider';
import { describe } from 'node:test';

export const metadata = {
    title: "DATA",
    description: 'Find your data'
}

const Rootlayout = ({children}) => {
  return (
    <html lang="en">
        <body>
            <div className="main">
                <div className='gradient'>
                </div>
            </div>
            <main className='app'>
                <Nav />
                {children}
            </main>
            <SearchBar />
            <AddTagButton />
        </body>
    </html>
  )
}

export default Rootlayout;