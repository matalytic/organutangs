import React from 'react';
import ListItem from './ListItem.jsx';

const List = (props) => (
  <div>
    <div className="yelp-list">
      
      {props.items.map((item, index) => 
      	<ListItem 
          listKey={index} 
          handleClick={props.handleClick} 
          item={item}
          favorited={!!props.favoriteLocations[item.id]}
          handleFavoriteClick={props.handleFavoriteClick}
          />)
      }
    </div>
  </div>
);

export default List;