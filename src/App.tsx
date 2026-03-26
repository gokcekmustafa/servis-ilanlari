import React from 'react';

const HomePage = () => {
    return (
        <div className="homepage">
            <div className="category-cards" style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#007bff', padding: '10px' }}>
                <div className="category-card">Category 1</div>
                <div className="category-card">Category 2</div>
                <div className="category-card">Category 3</div>
            </div>
            <div className="content" style={{ display: 'flex' }}>
                <div className="filters" style={{ width: '20%', padding: '10px', backgroundColor: '#f0f0f0' }}>
                    <h3>Filters</h3>
                    {/* Filters can be added here */}
                </div>
                <div className="listings" style={{ width: '80%', padding: '10px' }}>
                    <h3>Listings</h3>
                    {/* Listings can be rendered here */}
                </div>
            </div>
        </div>
    );
}

const App = () => {
    return (
        <div className="App">
            <HomePage />
        </div>
    );
}

export default App;
