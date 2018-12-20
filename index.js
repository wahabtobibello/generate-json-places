const fs = require("fs");
const countriesResponse = require("./countries-response");
const statesResponse = require("./states-response");
const citiesResponse = require("./cities-response");

const generateCountries = () => {
  const countries = countriesResponse.data.map(country => {
    const { slug, name, isoCode, countryCode } = country;
    return {
      slug,
      name,
      isoCode,
      countryCode
    };
  });

  fs.writeFile(`countries.json`, JSON.stringify(countries), function(err) {
    if (err) throw err;
  });
};

const generateStates = () => {
  const countries = countriesResponse.data.reduce((out, country) => {
    const { slug, id } = country;
    return {
      ...out,
      [id]: {
        slug,
        id
      }
    };
  }, {});

  const countryStates = statesResponse.data.reduce((out, stateData) => {
    const { name, slug, stateCode, lat, long } = stateData;
    const stateCountry = countries[stateData.country];
    const { slug: countrySlug } = stateCountry;
    return {
      ...out,
      [countrySlug]: [
        ...(out[countrySlug] || []),
        {
          name,
          slug,
          stateCode,
          lat,
          long
        }
      ]
    };
  }, {});
  const generateStates = () => {
    if (!fs.existsSync("states")) {
      fs.mkdirSync("states");
    }

    Object.keys(countryStates).forEach(country => {
      fs.writeFile(
        `states/${country}.json`,
        JSON.stringify(countryStates[country]),
        function(err) {
          if (err) throw err;
        }
      );
    });
  };

  const countries = countriesResponse.data.reduce((out, country) => {
    const { slug, id } = country;
    return {
      ...out,
      [id]: {
        slug
      }
    };
  }, {});

  const states = statesResponse.data.reduce((out, country) => {
    const { slug, id } = country;
    return {
      ...out,
      [id]: {
        slug
      }
    };
  }, {});

  const countryStateCities = citiesResponse.data.reduce((out, cityData) => {
    const cityCountry = countries[cityData.country];
    if (!cityCountry || !cityData.state) {
      return {
        ...out
      };
    }
    const cityState = states[cityData.state.id];
    const { name, slug } = cityData;

    return {
      ...out,
      [cityCountry.slug]: {
        ...(out[cityCountry.slug] || {}),
        [cityState.slug]: [
          ...((out[cityCountry.slug] &&
            out[cityCountry.slug][cityState.slug]) ||
            []),
          {
            name,
            slug
          }
        ]
      }
    };
  }, {});

  if (!fs.existsSync("cities")) {
    fs.mkdirSync("cities");
  }

  Object.keys(countryStateCities).forEach(country => {
    if (!fs.existsSync(`cities/${country}`)) {
      fs.mkdirSync(`cities/${country}`);
    }
    Object.keys(countryStateCities[country]).forEach(state => {
      fs.writeFile(
        `cities/${country}/${state}.json`,
        JSON.stringify(countryStateCities[country][state]),
        function(err) {
          if (err) throw err;
        }
      );
    });
  });
};
